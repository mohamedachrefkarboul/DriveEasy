package com.driveeasy.vehicule.controller;

import com.driveeasy.vehicule.dto.StatutUpdateRequest;
import com.driveeasy.vehicule.dto.VehiculeDTO;
import com.driveeasy.vehicule.exception.BadRequestException;
import com.driveeasy.vehicule.exception.ConflictException;
import com.driveeasy.vehicule.exception.ResourceNotFoundException;
import com.driveeasy.vehicule.model.Carburant;
import com.driveeasy.vehicule.model.StatutVehicule;
import com.driveeasy.vehicule.model.Vehicule;
import com.driveeasy.vehicule.repository.VehiculeRepository;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Year;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Contrôleur REST pour la gestion du parc automobile.
 * Endpoints: /vehicules
 */
@RestController
@RequestMapping("/vehicules")
public class VehiculeController {

    private final VehiculeRepository vehiculeRepository;

    public VehiculeController(VehiculeRepository vehiculeRepository) {
        this.vehiculeRepository = vehiculeRepository;
    }

    /**
     * GET /vehicules
     * Filtres optionnels : carburant, statut, prixMax
     */
    @GetMapping
    public ResponseEntity<List<VehiculeDTO>> getAllVehicules(
            @RequestParam(required = false) Carburant carburant,
            @RequestParam(required = false) StatutVehicule statut,
            @RequestParam(required = false) BigDecimal prixMax) {

        List<VehiculeDTO> list = vehiculeRepository.findAll(carburant, statut, prixMax).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    /**
     * GET /vehicules/{id}
     * Détail d'un véhicule par ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<VehiculeDTO> getVehiculeById(@PathVariable Long id) {
        Vehicule v = vehiculeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Véhicule avec l'ID " + id + " introuvable"));
        return ResponseEntity.ok(toDTO(v));
    }

    /**
     * POST /vehicules
     * Ajout d'un nouveau véhicule avec validations métier
     */
    @PostMapping
    public ResponseEntity<VehiculeDTO> createVehicule(@Valid @RequestBody VehiculeDTO dto) {
        // Règle de gestion : L'immatriculation doit être unique (erreur 409)
        if (vehiculeRepository.findByImmatriculation(dto.getImmatriculation()).isPresent()) {
            throw new ConflictException("Un véhicule avec l'immatriculation '" + dto.getImmatriculation() + "' existe déjà");
        }

        // Règle de gestion : L'année doit être cohérente (entre 1990 et année courante + 2)
        int currentYear = Year.now().getValue();
        if (dto.getAnnee() < 1990 || dto.getAnnee() > currentYear + 2) {
            throw new BadRequestException("L'année du véhicule doit être comprise entre 1990 et " + (currentYear + 2));
        }

        // Règle de gestion : Le prix journalier doit être strictement positif
        if (dto.getPrixJournalier() == null || dto.getPrixJournalier().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Le prix journalier doit être strictement supérieur à zéro");
        }

        Vehicule vehicule = toEntity(dto);
        if (vehicule.getStatut() == null) {
            vehicule.setStatut(StatutVehicule.DISPONIBLE);
        }

        Vehicule saved = vehiculeRepository.save(vehicule);
        return ResponseEntity.status(HttpStatus.CREATED).body(toDTO(saved));
    }

    /**
     * PUT /vehicules/{id}
     * Modification d'un véhicule existant
     */
    @PutMapping("/{id}")
    public ResponseEntity<VehiculeDTO> updateVehicule(@PathVariable Long id, @Valid @RequestBody VehiculeDTO dto) {
        Vehicule existing = vehiculeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Véhicule avec l'ID " + id + " introuvable"));

        // Vérification unicité immatriculation si modifiée
        vehiculeRepository.findByImmatriculation(dto.getImmatriculation()).ifPresent(v -> {
            if (!v.getId().equals(id)) {
                throw new ConflictException("L'immatriculation '" + dto.getImmatriculation() + "' est déjà attribuée à un autre véhicule");
            }
        });

        int currentYear = Year.now().getValue();
        if (dto.getAnnee() > currentYear) {
            throw new BadRequestException("L'année du véhicule ne peut pas dépasser " + currentYear);
        }

        existing.setImmatriculation(dto.getImmatriculation());
        existing.setMarque(dto.getMarque());
        existing.setModele(dto.getModele());
        existing.setAnnee(dto.getAnnee());
        existing.setCouleur(dto.getCouleur());
        existing.setCarburant(dto.getCarburant());
        existing.setBoite(dto.getBoite());
        existing.setNbPlaces(dto.getNbPlaces());
        existing.setKilometrage(dto.getKilometrage());
        existing.setPrixJournalier(dto.getPrixJournalier());
        if (dto.getStatut() != null) {
            existing.setStatut(dto.getStatut());
        }
        if (dto.getImageUrl() != null) {
            existing.setImageUrl(dto.getImageUrl());
        }

        Vehicule updated = vehiculeRepository.save(existing);
        return ResponseEntity.ok(toDTO(updated));
    }

    /**
     * DELETE /vehicules/{id}
     * Suppression : refusée si véhicule loué (Code 409)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVehicule(@PathVariable Long id) {
        Vehicule v = vehiculeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Véhicule avec l'ID " + id + " introuvable"));

        if (v.getStatut() == StatutVehicule.LOUE) {
            throw new ConflictException("Suppression refusée : le véhicule avec l'ID " + id + " est actuellement en location");
        }

        vehiculeRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * PATCH /vehicules/{id}/statut
     * Changement de statut (utilisé notamment par location-service)
     */
    @PatchMapping("/{id}/statut")
    public ResponseEntity<VehiculeDTO> updateStatut(
            @PathVariable Long id,
            @Valid @RequestBody StatutUpdateRequest request) {

        Vehicule v = vehiculeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Véhicule avec l'ID " + id + " introuvable"));

        v.setStatut(request.getStatut());
        if (request.getKilometrage() != null && request.getKilometrage() >= v.getKilometrage()) {
            v.setKilometrage(request.getKilometrage());
        }

        Vehicule updated = vehiculeRepository.save(v);
        return ResponseEntity.ok(toDTO(updated));
    }

    /**
     * GET /vehicules/disponibles
     * Liste des véhicules disponibles pour une période donnée
     */
    @GetMapping("/disponibles")
    public ResponseEntity<List<VehiculeDTO>> getVehiculesDisponibles(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateDebut,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFin) {

        List<VehiculeDTO> list = vehiculeRepository.findDisponibles().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    // Méthodes de mapping DTO <-> Entity
    private VehiculeDTO toDTO(Vehicule v) {
        VehiculeDTO dto = new VehiculeDTO();
        dto.setId(v.getId());
        dto.setImmatriculation(v.getImmatriculation());
        dto.setMarque(v.getMarque());
        dto.setModele(v.getModele());
        dto.setAnnee(v.getAnnee());
        dto.setCouleur(v.getCouleur());
        dto.setCarburant(v.getCarburant());
        dto.setBoite(v.getBoite());
        dto.setNbPlaces(v.getNbPlaces());
        dto.setKilometrage(v.getKilometrage());
        dto.setPrixJournalier(v.getPrixJournalier());
        dto.setStatut(v.getStatut());
        dto.setImageUrl(v.getImageUrl());
        return dto;
    }

    private Vehicule toEntity(VehiculeDTO dto) {
        return new Vehicule(
                dto.getId(),
                dto.getImmatriculation(),
                dto.getMarque(),
                dto.getModele(),
                dto.getAnnee(),
                dto.getCouleur(),
                dto.getCarburant(),
                dto.getBoite(),
                dto.getNbPlaces(),
                dto.getKilometrage(),
                dto.getPrixJournalier(),
                dto.getStatut(),
                dto.getImageUrl()
        );
    }
}
