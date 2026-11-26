package com.driveeasy.location.service;

import com.driveeasy.location.client.ClientServiceClient;
import com.driveeasy.location.client.VehiculeServiceClient;
import com.driveeasy.location.dto.*;
import com.driveeasy.location.exception.BadRequestException;
import com.driveeasy.location.exception.ResourceNotFoundException;
import com.driveeasy.location.model.Location;
import com.driveeasy.location.model.StatutLocation;
import com.driveeasy.location.repository.LocationRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class LocationService {

    private final LocationRepository locationRepository;
    private final ClientServiceClient clientServiceClient;
    private final VehiculeServiceClient vehiculeServiceClient;

    public LocationService(LocationRepository locationRepository,
                           ClientServiceClient clientServiceClient,
                           VehiculeServiceClient vehiculeServiceClient) {
        this.locationRepository = locationRepository;
        this.clientServiceClient = clientServiceClient;
        this.vehiculeServiceClient = vehiculeServiceClient;
    }

    /**
     * Simulation du prix sans création
     */
    public SimulationResponse simulerPrix(SimulationRequest req) {
        validerDates(req.getDateDebut(), req.getDateFinPrevue());

        ClientRemoteDTO client = getClientSafely(req.getClientId());
        VehiculeRemoteDTO vehicule = getVehiculeSafely(req.getVehiculeId());

        long nbJours = Math.max(1, ChronoUnit.DAYS.between(req.getDateDebut(), req.getDateFinPrevue()));
        BigDecimal prixJour = vehicule.getPrixJournalier();
        BigDecimal montantBase = prixJour.multiply(BigDecimal.valueOf(nbJours));

        // Remise fidélité selon cahier des charges : FIDELE 5%, VIP 10%, STANDARD 0%
        BigDecimal remisePct = BigDecimal.ZERO;
        String cat = client.getCategorieClient() != null ? client.getCategorieClient().toUpperCase() : "STANDARD";
        if ("VIP".equals(cat)) {
            remisePct = new BigDecimal("0.10");
        } else if ("FIDELE".equals(cat)) {
            remisePct = new BigDecimal("0.05");
        }

        BigDecimal montantRemise = montantBase.multiply(remisePct).setScale(2, RoundingMode.HALF_UP);
        BigDecimal montantTotal = montantBase.subtract(montantRemise).setScale(2, RoundingMode.HALF_UP);

        SimulationResponse res = new SimulationResponse();
        res.setNbJours(nbJours);
        res.setPrixJournalier(prixJour);
        res.setMontantBase(montantBase);
        res.setCategorieClient(cat);
        res.setRemisePourcentage(remisePct);
        res.setMontantRemise(montantRemise);
        res.setMontantTotal(montantTotal);
        return res;
    }

    /**
     * Création d'une réservation avec vérification inter-services
     */
    public LocationDTO creerReservation(LocationCreateRequest req) {
        validerDates(req.getDateDebut(), req.getDateFinPrevue());

        // 1. Contrôle de l'éligibilité du client (Appel inter-service synchrone)
        EligibiliteRemoteDTO eligibilite;
        try {
            eligibilite = clientServiceClient.checkEligibilite(req.getClientId());
        } catch (Exception e) {
            throw new BadRequestException("Impossible de vérifier l'éligibilité du client : " + e.getMessage());
        }

        if (eligibilite == null || !eligibilite.isEligible()) {
            String motif = eligibilite != null ? eligibilite.getMotif() : "Client inéligible";
            throw new BadRequestException("Réservation refusée : " + motif);
        }

        // 2. Vérification de la disponibilité du véhicule (Appel inter-service synchrone)
        VehiculeRemoteDTO vehicule;
        try {
            vehicule = vehiculeServiceClient.getVehiculeById(req.getVehiculeId());
        } catch (Exception e) {
            throw new BadRequestException("Impossible de vérifier le véhicule : " + e.getMessage());
        }

        if (vehicule == null) {
            throw new ResourceNotFoundException("Véhicule avec l'ID " + req.getVehiculeId() + " introuvable");
        }

        if ("MAINTENANCE".equalsIgnoreCase(vehicule.getStatut())) {
            throw new BadRequestException("Le véhicule " + vehicule.getImmatriculation() + " est actuellement en maintenance");
        }

        // Vérification des conflits de réservation sur la même période
        List<Location> conflits = locationRepository.findActiveReservationsForVehicule(
                req.getVehiculeId(), req.getDateDebut(), req.getDateFinPrevue());
        if (!conflits.isEmpty()) {
            throw new BadRequestException("Le véhicule est déjà réservé ou en cours de location sur cette période");
        }

        // 3. Calcul du prix avec remises fidélité
        ClientRemoteDTO client = clientServiceClient.getClientById(req.getClientId());
        long nbJours = Math.max(1, ChronoUnit.DAYS.between(req.getDateDebut(), req.getDateFinPrevue()));
        BigDecimal prixJour = vehicule.getPrixJournalier();
        BigDecimal montantBase = prixJour.multiply(BigDecimal.valueOf(nbJours));

        BigDecimal remisePct = BigDecimal.ZERO;
        String cat = client != null && client.getCategorieClient() != null ? client.getCategorieClient().toUpperCase() : "STANDARD";
        if ("VIP".equals(cat)) {
            remisePct = new BigDecimal("0.10");
        } else if ("FIDELE".equals(cat)) {
            remisePct = new BigDecimal("0.05");
        }

        BigDecimal montantRemise = montantBase.multiply(remisePct).setScale(2, RoundingMode.HALF_UP);
        BigDecimal montantTotal = montantBase.subtract(montantRemise).setScale(2, RoundingMode.HALF_UP);

        Location loc = new Location();
        loc.setClientId(req.getClientId());
        loc.setVehiculeId(req.getVehiculeId());
        loc.setDateDebut(req.getDateDebut());
        loc.setDateFinPrevue(req.getDateFinPrevue());
        loc.setPrixJournalierApplique(prixJour);
        loc.setMontantTotal(montantTotal);
        loc.setPenalite(BigDecimal.ZERO);
        loc.setStatut(StatutLocation.RESERVEE);
        loc.setDateCreation(LocalDateTime.now());

        Location saved = locationRepository.save(loc);
        return toDTO(saved);
    }

    /**
     * Démarrage de la location (statut EN_COURS)
     * Règle : Met à jour le véhicule en statut 'LOUE'
     */
    public LocationDTO demarrerLocation(Long id, DepartRequest req) {
        Location loc = locationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Location avec l'ID " + id + " introuvable"));

        if (loc.getStatut() != StatutLocation.RESERVEE) {
            throw new BadRequestException("Seule une réservation au statut RESERVEE peut être démarrée");
        }

        Double km = (req != null && req.getKmDepart() != null) ? req.getKmDepart() : null;
        if (km == null) {
            VehiculeRemoteDTO v = getVehiculeSafely(loc.getVehiculeId());
            km = v != null ? v.getKilometrage() : 0.0;
        }

        loc.setKmDepart(km);
        loc.setStatut(StatutLocation.EN_COURS);

        // Appel inter-service : passage du véhicule à LOUE
        try {
            vehiculeServiceClient.updateStatut(loc.getVehiculeId(), new StatutUpdateRemoteDTO("LOUE", km));
        } catch (Exception e) {
            // Compensation en cas d'échec
            loc.setStatut(StatutLocation.RESERVEE);
            throw new BadRequestException("Échec de la mise à jour du statut du véhicule : " + e.getMessage());
        }

        Location updated = locationRepository.save(loc);
        return toDTO(updated);
    }

    /**
     * Retour du véhicule (statut TERMINEE)
     * Règle : Calcul de pénalité de retard (1.5 * prixJournalier par jour de retard)
     * Repasse le véhicule à DISPONIBLE
     * Met à jour la catégorie de fidélité du client (5 -> FIDELE, 15 -> VIP)
     */
    public LocationDTO enregistrerRetour(Long id, RetourRequest req) {
        Location loc = locationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Location avec l'ID " + id + " introuvable"));

        if (loc.getStatut() != StatutLocation.EN_COURS) {
            throw new BadRequestException("Seule une location EN_COURS peut être clôturée");
        }

        LocalDate dateRetour = (req.getDateRetourEffectif() != null) ? req.getDateRetourEffectif() : LocalDate.now();
        loc.setDateRetourEffectif(dateRetour);
        loc.setKmRetour(req.getKmRetour());

        // Calcul pénalités de retard
        BigDecimal penalite = BigDecimal.ZERO;
        if (dateRetour.isAfter(loc.getDateFinPrevue())) {
            long joursRetard = ChronoUnit.DAYS.between(loc.getDateFinPrevue(), dateRetour);
            BigDecimal tauxPenaliteJour = loc.getPrixJournalierApplique().multiply(new BigDecimal("1.5"));
            penalite = tauxPenaliteJour.multiply(BigDecimal.valueOf(joursRetard)).setScale(2, RoundingMode.HALF_UP);
        }
        loc.setPenalite(penalite);
        loc.setMontantTotal(loc.getMontantTotal().add(penalite));
        loc.setStatut(StatutLocation.TERMINEE);

        // 1. Appel inter-service : passage du véhicule à DISPONIBLE et maj km
        try {
            vehiculeServiceClient.updateStatut(loc.getVehiculeId(),
                    new StatutUpdateRemoteDTO("DISPONIBLE", req.getKmRetour()));
        } catch (Exception e) {
            System.err.println("Avertissement : échec mise à jour véhicule au retour : " + e.getMessage());
        }

        Location saved = locationRepository.save(loc);

        // 2. Gestion de la fidélité automatique : FIDELE après 5 locations, VIP après 15
        verifierEtMettreAJourFidelite(loc.getClientId());

        return toDTO(saved);
    }

    /**
     * Annulation d'une réservation
     */
    public LocationDTO annulerLocation(Long id) {
        Location loc = locationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Location avec l'ID " + id + " introuvable"));

        if (loc.getStatut() == StatutLocation.TERMINEE) {
            throw new BadRequestException("Une location terminée ne peut pas être annulée");
        }

        if (loc.getStatut() == StatutLocation.EN_COURS) {
            // Si en cours, on remet le véhicule en DISPONIBLE
            try {
                vehiculeServiceClient.updateStatut(loc.getVehiculeId(), new StatutUpdateRemoteDTO("DISPONIBLE"));
            } catch (Exception ignored) {}
        }

        loc.setStatut(StatutLocation.ANNULEE);
        Location updated = locationRepository.save(loc);
        return toDTO(updated);
    }

    /**
     * Détail enrichi : Location + Client + Véhicule agrégés
     */
    public LocationDetailDTO getDetailEnrichi(Long id) {
        Location loc = locationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Location avec l'ID " + id + " introuvable"));

        ClientRemoteDTO client = null;
        try {
            client = clientServiceClient.getClientById(loc.getClientId());
        } catch (Exception e) {
            System.err.println("Avertissement : impossible de récupérer le client " + loc.getClientId());
        }

        VehiculeRemoteDTO vehicule = null;
        try {
            vehicule = vehiculeServiceClient.getVehiculeById(loc.getVehiculeId());
        } catch (Exception e) {
            System.err.println("Avertissement : impossible de récupérer le véhicule " + loc.getVehiculeId());
        }

        return new LocationDetailDTO(toDTO(loc), client, vehicule);
    }

    /**
     * Statistiques globales de l'activité
     */
    public StatistiquesDTO getStatistiques() {
        Collection<Location> all = locationRepository.getAll();

        BigDecimal caTotal = all.stream()
                .filter(l -> l.getStatut() == StatutLocation.TERMINEE || l.getStatut() == StatutLocation.EN_COURS)
                .map(Location::getMontantTotal)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long nbTotal = all.size();
        long nbEnCours = all.stream().filter(l -> l.getStatut() == StatutLocation.EN_COURS).count();
        long nbTerminees = all.stream().filter(l -> l.getStatut() == StatutLocation.TERMINEE).count();

        // Taux d'occupation basé sur vehicule-service
        double tauxOccupation = 0.0;
        List<VehiculeRemoteDTO> vehicules = null;
        try {
            vehicules = vehiculeServiceClient.getAllVehicules();
            if (vehicules != null && !vehicules.isEmpty()) {
                long loues = vehicules.stream().filter(v -> "LOUE".equalsIgnoreCase(v.getStatut())).count();
                tauxOccupation = Math.round(((double) loues / vehicules.size() * 100.0) * 10.0) / 10.0;
            }
        } catch (Exception ignored) {}

        // Top véhicules les plus loués
        Map<Long, Long> countsByVehicule = all.stream()
                .filter(l -> l.getStatut() != StatutLocation.ANNULEE)
                .collect(Collectors.groupingBy(Location::getVehiculeId, Collectors.counting()));

        List<Map<String, Object>> topVehicules = new ArrayList<>();
        countsByVehicule.entrySet().stream()
                .sorted(Map.Entry.<Long, Long>comparingByValue().reversed())
                .limit(5)
                .forEach(entry -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("vehiculeId", entry.getKey());
                    item.put("locationsCount", entry.getValue());
                    try {
                        VehiculeRemoteDTO v = vehiculeServiceClient.getVehiculeById(entry.getKey());
                        if (v != null) {
                            item.put("immatriculation", v.getImmatriculation());
                            item.put("marque", v.getMarque());
                            item.put("modele", v.getModele());
                        }
                    } catch (Exception ignored) {}
                    topVehicules.add(item);
                });

        StatistiquesDTO stats = new StatistiquesDTO();
        stats.setChiffreAffairesTotal(caTotal);
        stats.setNombreLocationsTotal(nbTotal);
        stats.setNombreLocationsEnCours(nbEnCours);
        stats.setNombreLocationsTerminees(nbTerminees);
        stats.setTauxOccupation(tauxOccupation);
        stats.setTopVehicules(topVehicules);
        return stats;
    }

    private void verifierEtMettreAJourFidelite(Long clientId) {
        long count = locationRepository.countCompletedLocationsByClientId(clientId);
        String nouvelleCategorie = null;
        if (count >= 15) {
            nouvelleCategorie = "VIP";
        } else if (count >= 5) {
            nouvelleCategorie = "FIDELE";
        }

        if (nouvelleCategorie != null) {
            try {
                clientServiceClient.updateCategorie(clientId, new CategorieUpdateRemoteDTO(nouvelleCategorie));
            } catch (Exception e) {
                System.err.println("Avertissement : échec mise à jour fidélité client : " + e.getMessage());
            }
        }
    }

    private ClientRemoteDTO getClientSafely(Long clientId) {
        try {
            ClientRemoteDTO client = clientServiceClient.getClientById(clientId);
            if (client == null) {
                throw new ResourceNotFoundException("Client avec l'ID " + clientId + " introuvable");
            }
            return client;
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new BadRequestException("Impossible d'accéder à client-service : " + e.getMessage());
        }
    }

    private VehiculeRemoteDTO getVehiculeSafely(Long vehiculeId) {
        try {
            VehiculeRemoteDTO v = vehiculeServiceClient.getVehiculeById(vehiculeId);
            if (v == null) {
                throw new ResourceNotFoundException("Véhicule avec l'ID " + vehiculeId + " introuvable");
            }
            return v;
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new BadRequestException("Impossible d'accéder à vehicule-service : " + e.getMessage());
        }
    }

    private void validerDates(LocalDate debut, LocalDate fin) {
        if (debut == null || fin == null) {
            throw new BadRequestException("Les dates de début et de fin sont obligatoires");
        }
        if (fin.isBefore(debut)) {
            throw new BadRequestException("La date de fin prévue ne peut pas être antérieure à la date de début");
        }
    }

    public LocationDTO toDTO(Location loc) {
        LocationDTO dto = new LocationDTO();
        dto.setId(loc.getId());
        dto.setClientId(loc.getClientId());
        dto.setVehiculeId(loc.getVehiculeId());
        dto.setDateDebut(loc.getDateDebut());
        dto.setDateFinPrevue(loc.getDateFinPrevue());
        dto.setDateRetourEffectif(loc.getDateRetourEffectif());
        dto.setKmDepart(loc.getKmDepart());
        dto.setKmRetour(loc.getKmRetour());
        dto.setPrixJournalierApplique(loc.getPrixJournalierApplique());
        dto.setMontantTotal(loc.getMontantTotal());
        dto.setPenalite(loc.getPenalite());
        dto.setStatut(loc.getStatut());
        dto.setDateCreation(loc.getDateCreation());
        return dto;
    }
}
