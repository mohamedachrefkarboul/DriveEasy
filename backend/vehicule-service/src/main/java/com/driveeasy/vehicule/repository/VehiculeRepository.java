package com.driveeasy.vehicule.repository;

import com.driveeasy.vehicule.model.BoiteVitesse;
import com.driveeasy.vehicule.model.Carburant;
import com.driveeasy.vehicule.model.StatutVehicule;
import com.driveeasy.vehicule.model.Vehicule;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

/**
 * Repository en mémoire vive (RAM) pour la gestion des véhicules.
 * Conforme à la consigne : l'utilisation de base de données externe est strictement interdite.
 */
@Repository
public class VehiculeRepository {

    private final Map<Long, Vehicule> vehiculesMap = new ConcurrentHashMap<>();
    private final AtomicLong idSequence = new AtomicLong(0);

    @PostConstruct
    public void initDemoData() {
        // Initialisation de véhicules de démonstration pour le parc automobile
        saveVehiculeInternal(new Vehicule(null, "210-TN-4521", "Peugeot", "208", 2023, "Blanc",
                Carburant.ESSENCE, BoiteVitesse.MANUELLE, 5, 18500.0, new BigDecimal("85.00"),
                StatutVehicule.DISPONIBLE, "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=600"));

        saveVehiculeInternal(new Vehicule(null, "225-TN-7890", "Renault", "Clio 5", 2022, "Gris",
                Carburant.DIESEL, BoiteVitesse.MANUELLE, 5, 34200.0, new BigDecimal("75.00"),
                StatutVehicule.DISPONIBLE, "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600"));

        saveVehiculeInternal(new Vehicule(null, "230-TN-1122", "Volkswagen", "Golf 8", 2024, "Noir",
                Carburant.ESSENCE, BoiteVitesse.AUTOMATIQUE, 5, 9800.0, new BigDecimal("130.00"),
                StatutVehicule.DISPONIBLE, "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600"));

        saveVehiculeInternal(new Vehicule(null, "215-TN-3344", "Toyota", "Yaris Hybride", 2023, "Bleu",
                Carburant.HYBRIDE, BoiteVitesse.AUTOMATIQUE, 5, 21000.0, new BigDecimal("95.00"),
                StatutVehicule.LOUE, "https://images.unsplash.com/photo-1590362891991-f776e747a588?w=600"));

        saveVehiculeInternal(new Vehicule(null, "240-TN-5566", "Tesla", "Model 3", 2024, "Rouge",
                Carburant.ELECTRIQUE, BoiteVitesse.AUTOMATIQUE, 5, 12400.0, new BigDecimal("190.00"),
                StatutVehicule.DISPONIBLE, "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=600"));

        saveVehiculeInternal(new Vehicule(null, "198-TN-9988", "Hyundai", "Tucson", 2021, "Gris Foncé",
                Carburant.DIESEL, BoiteVitesse.AUTOMATIQUE, 5, 62000.0, new BigDecimal("150.00"),
                StatutVehicule.MAINTENANCE, "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=600"));
    }

    private Vehicule saveVehiculeInternal(Vehicule v) {
        if (v.getId() == null) {
            v.setId(idSequence.incrementAndGet());
        }
        vehiculesMap.put(v.getId(), v);
        return v;
    }

    public List<Vehicule> findAll(Carburant carburant, StatutVehicule statut, BigDecimal prixMax) {
        return vehiculesMap.values().stream()
                .filter(v -> carburant == null || v.getCarburant() == carburant)
                .filter(v -> statut == null || v.getStatut() == statut)
                .filter(v -> prixMax == null || v.getPrixJournalier().compareTo(prixMax) <= 0)
                .sorted(Comparator.comparing(Vehicule::getId))
                .collect(Collectors.toList());
    }

    public Optional<Vehicule> findById(Long id) {
        return Optional.ofNullable(vehiculesMap.get(id));
    }

    public Optional<Vehicule> findByImmatriculation(String immatriculation) {
        return vehiculesMap.values().stream()
                .filter(v -> v.getImmatriculation().equalsIgnoreCase(immatriculation.trim()))
                .findFirst();
    }

    public Vehicule save(Vehicule vehicule) {
        if (vehicule.getId() == null) {
            vehicule.setId(idSequence.incrementAndGet());
        }
        vehiculesMap.put(vehicule.getId(), vehicule);
        return vehicule;
    }

    public boolean deleteById(Long id) {
        return vehiculesMap.remove(id) != null;
    }

    public List<Vehicule> findDisponibles() {
        return vehiculesMap.values().stream()
                .filter(v -> v.getStatut() == StatutVehicule.DISPONIBLE)
                .sorted(Comparator.comparing(Vehicule::getId))
                .collect(Collectors.toList());
    }
}
