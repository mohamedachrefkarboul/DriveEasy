package com.driveeasy.location.controller;

import com.driveeasy.location.dto.*;
import com.driveeasy.location.model.Location;
import com.driveeasy.location.model.StatutLocation;
import com.driveeasy.location.repository.LocationRepository;
import com.driveeasy.location.service.LocationService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Contrôleur REST pour la gestion du cycle de vie des locations.
 * Endpoints: /locations
 */
@RestController
@RequestMapping("/locations")
public class LocationController {

    private final LocationService locationService;
    private final LocationRepository locationRepository;

    public LocationController(LocationService locationService, LocationRepository locationRepository) {
        this.locationService = locationService;
        this.locationRepository = locationRepository;
    }

    /**
     * GET /locations
     * Liste paginée et filtrable (statut, clientId, vehiculeId, période)
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllLocations(
            @RequestParam(required = false) StatutLocation statut,
            @RequestParam(required = false) Long clientId,
            @RequestParam(required = false) Long vehiculeId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateDebut,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFin,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        List<Location> filtered = locationRepository.findAll(statut, clientId, vehiculeId, dateDebut, dateFin);
        int totalElements = filtered.size();
        int totalPages = (int) Math.ceil((double) totalElements / size);
        int fromIndex = Math.min(page * size, totalElements);
        int toIndex = Math.min(fromIndex + size, totalElements);

        List<LocationDTO> content = filtered.subList(fromIndex, toIndex).stream()
                .map(locationService::toDTO)
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("content", content);
        response.put("currentPage", page);
        response.put("pageSize", size);
        response.put("totalElements", totalElements);
        response.put("totalPages", totalPages);

        return ResponseEntity.ok(response);
    }

    /**
     * GET /locations/{id}
     * Détail enrichi d'une location (agrégation avec client et véhicule)
     */
    @GetMapping("/{id}")
    public ResponseEntity<LocationDetailDTO> getLocationById(@PathVariable Long id) {
        LocationDetailDTO detail = locationService.getDetailEnrichi(id);
        return ResponseEntity.ok(detail);
    }

    /**
     * POST /locations
     * Création d'une nouvelle réservation après vérification d'éligibilité et disponibilité
     */
    @PostMapping
    public ResponseEntity<LocationDTO> createLocation(@Valid @RequestBody LocationCreateRequest request) {
        LocationDTO created = locationService.creerReservation(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * POST /locations/simulation
     * Simulation du prix et calcul des remises de fidélité
     */
    @PostMapping("/simulation")
    public ResponseEntity<SimulationResponse> simulerLocation(@Valid @RequestBody SimulationRequest request) {
        SimulationResponse sim = locationService.simulerPrix(request);
        return ResponseEntity.ok(sim);
    }

    /**
     * PATCH /locations/{id}/depart
     * Démarrage de la location (passage au statut EN_COURS et mise à jour du statut véhicule à LOUE)
     */
    @PatchMapping("/{id}/depart")
    public ResponseEntity<LocationDTO> demarrerLocation(
            @PathVariable Long id,
            @RequestBody(required = false) DepartRequest request) {
        LocationDTO dto = locationService.demarrerLocation(id, request);
        return ResponseEntity.ok(dto);
    }

    /**
     * PATCH /locations/{id}/retour
     * Clôture de la location, enregistrement km retour, pénalités éventuelles et passage véhicule à DISPONIBLE
     */
    @PatchMapping("/{id}/retour")
    public ResponseEntity<LocationDTO> retournerLocation(
            @PathVariable Long id,
            @Valid @RequestBody RetourRequest request) {
        LocationDTO dto = locationService.enregistrerRetour(id, request);
        return ResponseEntity.ok(dto);
    }

    /**
     * PATCH /locations/{id}/annulation
     * Annulation d'une réservation existante
     */
    @PatchMapping("/{id}/annulation")
    public ResponseEntity<LocationDTO> annulerLocation(@PathVariable Long id) {
        LocationDTO dto = locationService.annulerLocation(id);
        return ResponseEntity.ok(dto);
    }

    /**
     * GET /locations/statistiques
     * Indicateurs clés : CA total, taux d'occupation du parc, top véhicules les plus loués
     */
    @GetMapping("/statistiques")
    public ResponseEntity<StatistiquesDTO> getStatistiques() {
        StatistiquesDTO stats = locationService.getStatistiques();
        return ResponseEntity.ok(stats);
    }
}
