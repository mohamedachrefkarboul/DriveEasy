package com.driveeasy.location.repository;

import com.driveeasy.location.model.Location;
import com.driveeasy.location.model.StatutLocation;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

/**
 * Repository en mémoire vive (RAM) pour la gestion des locations.
 * Conforme à la consigne : l'utilisation de base de données externe est strictement interdite.
 */
@Repository
public class LocationRepository {

    private final Map<Long, Location> locationsMap = new ConcurrentHashMap<>();
    private final AtomicLong idSequence = new AtomicLong(0);

    @PostConstruct
    public void initDemoData() {
        // 1. Location terminée (Client 1, Véhicule 1)
        saveInternal(new Location(null, 1L, 1L,
                LocalDate.now().minusDays(10), LocalDate.now().minusDays(7), LocalDate.now().minusDays(7),
                18000.0, 18500.0, new BigDecimal("85.00"), new BigDecimal("255.00"),
                BigDecimal.ZERO, StatutLocation.TERMINEE, LocalDateTime.now().minusDays(11)));

        // 2. Location en cours (Client 2, Véhicule 4)
        saveInternal(new Location(null, 2L, 4L,
                LocalDate.now().minusDays(2), LocalDate.now().plusDays(2), null,
                20500.0, null, new BigDecimal("95.00"), new BigDecimal("361.00"), // 4j * 95 - 5% = 361
                BigDecimal.ZERO, StatutLocation.EN_COURS, LocalDateTime.now().minusDays(3)));

        // 3. Location réservée (Client 3, Véhicule 3)
        saveInternal(new Location(null, 3L, 3L,
                LocalDate.now().plusDays(1), LocalDate.now().plusDays(4), null,
                null, null, new BigDecimal("130.00"), new BigDecimal("351.00"), // 3j * 130 - 10% = 351
                BigDecimal.ZERO, StatutLocation.RESERVEE, LocalDateTime.now().minusDays(1)));

        // 4. Autre location terminée pour Client 2 (historique fidélité)
        saveInternal(new Location(null, 2L, 2L,
                LocalDate.now().minusDays(20), LocalDate.now().minusDays(18), LocalDate.now().minusDays(18),
                33500.0, 33800.0, new BigDecimal("75.00"), new BigDecimal("142.50"),
                BigDecimal.ZERO, StatutLocation.TERMINEE, LocalDateTime.now().minusDays(22)));
    }

    private Location saveInternal(Location loc) {
        if (loc.getId() == null) {
            loc.setId(idSequence.incrementAndGet());
        }
        locationsMap.put(loc.getId(), loc);
        return loc;
    }

    public List<Location> findAll(StatutLocation statut, Long clientId, Long vehiculeId,
                                  LocalDate dateDebut, LocalDate dateFin) {
        return locationsMap.values().stream()
                .filter(l -> statut == null || l.getStatut() == statut)
                .filter(l -> clientId == null || l.getClientId().equals(clientId))
                .filter(l -> vehiculeId == null || l.getVehiculeId().equals(vehiculeId))
                .filter(l -> dateDebut == null || !l.getDateDebut().isBefore(dateDebut))
                .filter(l -> dateFin == null || !l.getDateFinPrevue().isAfter(dateFin))
                .sorted(Comparator.comparing(Location::getId).reversed())
                .collect(Collectors.toList());
    }

    public Optional<Location> findById(Long id) {
        return Optional.ofNullable(locationsMap.get(id));
    }

    public Location save(Location location) {
        if (location.getId() == null) {
            location.setId(idSequence.incrementAndGet());
        }
        locationsMap.put(location.getId(), location);
        return location;
    }

    public long countCompletedLocationsByClientId(Long clientId) {
        return locationsMap.values().stream()
                .filter(l -> l.getClientId().equals(clientId) && l.getStatut() == StatutLocation.TERMINEE)
                .count();
    }

    public List<Location> findActiveReservationsForVehicule(Long vehiculeId, LocalDate debut, LocalDate fin) {
        return locationsMap.values().stream()
                .filter(l -> l.getVehiculeId().equals(vehiculeId))
                .filter(l -> l.getStatut() == StatutLocation.RESERVEE || l.getStatut() == StatutLocation.EN_COURS)
                .filter(l -> !(fin.isBefore(l.getDateDebut()) || debut.isAfter(l.getDateFinPrevue())))
                .collect(Collectors.toList());
    }

    public Collection<Location> getAll() {
        return locationsMap.values();
    }
}
