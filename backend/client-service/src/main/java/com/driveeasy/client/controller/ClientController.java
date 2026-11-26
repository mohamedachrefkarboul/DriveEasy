package com.driveeasy.client.controller;

import com.driveeasy.client.dto.CategorieUpdateRequest;
import com.driveeasy.client.dto.ClientDTO;
import com.driveeasy.client.dto.EligibiliteResponseDTO;
import com.driveeasy.client.exception.BadRequestException;
import com.driveeasy.client.exception.ConflictException;
import com.driveeasy.client.exception.ResourceNotFoundException;
import com.driveeasy.client.model.CategorieClient;
import com.driveeasy.client.model.Client;
import com.driveeasy.client.repository.ClientRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.Period;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Contrôleur REST pour la gestion des clients et de leur éligibilité.
 * Endpoints: /clients
 */
@RestController
@RequestMapping("/clients")
public class ClientController {

    private final ClientRepository clientRepository;

    public ClientController(ClientRepository clientRepository) {
        this.clientRepository = clientRepository;
    }

    /**
     * GET /clients
     * Recherche par mot-clé (nom, prénom, CIN, email)
     */
    @GetMapping
    public ResponseEntity<List<ClientDTO>> getAllClients(@RequestParam(required = false) String query) {
        List<ClientDTO> list = clientRepository.findAll(query).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    /**
     * GET /clients/{id}
     * Détail d'un client par son identifiant
     */
    @GetMapping("/{id}")
    public ResponseEntity<ClientDTO> getClientById(@PathVariable Long id) {
        Client c = clientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Client avec l'ID " + id + " introuvable"));
        return ResponseEntity.ok(toDTO(c));
    }

    /**
     * POST /clients
     * Création d'un client avec vérification d'unicité (CIN, email, numéro permis)
     */
    @PostMapping
    public ResponseEntity<ClientDTO> createClient(@Valid @RequestBody ClientDTO dto) {
        // Règles d'unicité : CIN, email, numéro de permis
        if (clientRepository.findByCin(dto.getCin()).isPresent()) {
            throw new ConflictException("Un client avec le CIN '" + dto.getCin() + "' existe déjà");
        }
        if (clientRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new ConflictException("Un client avec l'email '" + dto.getEmail() + "' existe déjà");
        }
        if (clientRepository.findByNumeroPermis(dto.getNumeroPermis()).isPresent()) {
            throw new ConflictException("Un client avec le numéro de permis '" + dto.getNumeroPermis() + "' existe déjà");
        }

        Client client = toEntity(dto);
        if (client.getCategorieClient() == null) {
            client.setCategorieClient(CategorieClient.STANDARD);
        }
        if (client.getDateInscription() == null) {
            client.setDateInscription(LocalDate.now());
        }

        Client saved = clientRepository.save(client);
        return ResponseEntity.status(HttpStatus.CREATED).body(toDTO(saved));
    }

    /**
     * PUT /clients/{id}
     * Modification d'un client existant
     */
    @PutMapping("/{id}")
    public ResponseEntity<ClientDTO> updateClient(@PathVariable Long id, @Valid @RequestBody ClientDTO dto) {
        Client existing = clientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Client avec l'ID " + id + " introuvable"));

        // Vérification unicité en excluant le client courant
        clientRepository.findByCin(dto.getCin()).ifPresent(c -> {
            if (!c.getId().equals(id)) {
                throw new ConflictException("Le CIN '" + dto.getCin() + "' est déjà utilisé");
            }
        });
        clientRepository.findByEmail(dto.getEmail()).ifPresent(c -> {
            if (!c.getId().equals(id)) {
                throw new ConflictException("L'email '" + dto.getEmail() + "' est déjà utilisé");
            }
        });
        clientRepository.findByNumeroPermis(dto.getNumeroPermis()).ifPresent(c -> {
            if (!c.getId().equals(id)) {
                throw new ConflictException("Le numéro de permis '" + dto.getNumeroPermis() + "' est déjà utilisé");
            }
        });

        existing.setCin(dto.getCin());
        existing.setNom(dto.getNom());
        existing.setPrenom(dto.getPrenom());
        existing.setDateNaissance(dto.getDateNaissance());
        existing.setEmail(dto.getEmail());
        existing.setTelephone(dto.getTelephone());
        existing.setAdresse(dto.getAdresse());
        existing.setNumeroPermis(dto.getNumeroPermis());
        existing.setDateExpirationPermis(dto.getDateExpirationPermis());
        if (dto.getCategorieClient() != null) {
            existing.setCategorieClient(dto.getCategorieClient());
        }

        Client updated = clientRepository.save(existing);
        return ResponseEntity.ok(toDTO(updated));
    }

    /**
     * DELETE /clients/{id}
     * Suppression d'un client
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteClient(@PathVariable Long id) {
        clientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Client avec l'ID " + id + " introuvable"));

        clientRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * GET /clients/{id}/eligibilite
     * Règle de gestion : Âge >= 21 ans ET permis non expiré
     */
    @GetMapping("/{id}/eligibilite")
    public ResponseEntity<EligibiliteResponseDTO> checkEligibilite(@PathVariable Long id) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Client avec l'ID " + id + " introuvable"));

        int age = Period.between(client.getDateNaissance(), LocalDate.now()).getYears();
        boolean permisValide = client.getDateExpirationPermis() != null &&
                !client.getDateExpirationPermis().isBefore(LocalDate.now());

        boolean eligible = true;
        StringBuilder motif = new StringBuilder();

        if (age < 21) {
            eligible = false;
            motif.append("Le client a ").append(age).append(" ans. L'âge minimum requis est de 21 ans. ");
        }
        if (!permisValide) {
            eligible = false;
            motif.append("Le permis de conduire est expiré depuis le ")
                    .append(client.getDateExpirationPermis()).append(". ");
        }

        if (eligible) {
            motif.append("Client éligible à la location de véhicules.");
        }

        EligibiliteResponseDTO response = new EligibiliteResponseDTO(
                eligible,
                motif.toString().trim(),
                age,
                permisValide
        );

        return ResponseEntity.ok(response);
    }

    /**
     * PATCH /clients/{id}/categorie
     * Mise à jour de la catégorie de fidélité (STANDARD, FIDELE, VIP)
     */
    @PatchMapping("/{id}/categorie")
    public ResponseEntity<ClientDTO> updateCategorie(
            @PathVariable Long id,
            @Valid @RequestBody CategorieUpdateRequest request) {

        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Client avec l'ID " + id + " introuvable"));

        client.setCategorieClient(request.getCategorieClient());
        Client updated = clientRepository.save(client);
        return ResponseEntity.ok(toDTO(updated));
    }

    // Mappings DTO <-> Entity
    private ClientDTO toDTO(Client c) {
        ClientDTO dto = new ClientDTO();
        dto.setId(c.getId());
        dto.setCin(c.getCin());
        dto.setNom(c.getNom());
        dto.setPrenom(c.getPrenom());
        dto.setDateNaissance(c.getDateNaissance());
        dto.setEmail(c.getEmail());
        dto.setTelephone(c.getTelephone());
        dto.setAdresse(c.getAdresse());
        dto.setNumeroPermis(c.getNumeroPermis());
        dto.setDateExpirationPermis(c.getDateExpirationPermis());
        dto.setCategorieClient(c.getCategorieClient());
        dto.setDateInscription(c.getDateInscription());
        return dto;
    }

    private Client toEntity(ClientDTO dto) {
        return new Client(
                dto.getId(),
                dto.getCin(),
                dto.getNom(),
                dto.getPrenom(),
                dto.getDateNaissance(),
                dto.getEmail(),
                dto.getTelephone(),
                dto.getAdresse(),
                dto.getNumeroPermis(),
                dto.getDateExpirationPermis(),
                dto.getCategorieClient(),
                dto.getDateInscription()
        );
    }
}
