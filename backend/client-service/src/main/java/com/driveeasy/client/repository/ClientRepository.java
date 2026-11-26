package com.driveeasy.client.repository;

import com.driveeasy.client.model.CategorieClient;
import com.driveeasy.client.model.Client;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

/**
 * Repository en mémoire vive (RAM) pour la gestion des clients.
 * Conforme à la consigne : l'utilisation de base de données externe est strictement interdite.
 */
@Repository
public class ClientRepository {

    private final Map<Long, Client> clientsMap = new ConcurrentHashMap<>();
    private final AtomicLong idSequence = new AtomicLong(0);

    @PostConstruct
    public void initDemoData() {
        // 1. Client Standard (Éligible : > 21 ans, permis valide)
        saveClientInternal(new Client(null, "08123456", "Ben Ali", "Ahmed",
                LocalDate.of(1995, 4, 15), "ahmed.benali@gmail.com", "+216 20 111 222",
                "12 Rue de la Liberté, Tunis", "P-11223344", LocalDate.of(2028, 6, 30),
                CategorieClient.STANDARD, LocalDate.of(2024, 1, 10)));

        // 2. Client Fidèle (Éligible : remise 5%)
        saveClientInternal(new Client(null, "09234567", "Trabelsi", "Sarra",
                LocalDate.of(1998, 9, 22), "sarra.trabelsi@yahoo.fr", "+216 55 333 444",
                "45 Avenue Habib Bourguiba, Ariana", "P-55667788", LocalDate.of(2029, 11, 15),
                CategorieClient.FIDELE, LocalDate.of(2023, 5, 20)));

        // 3. Client VIP (Éligible : remise 10%)
        saveClientInternal(new Client(null, "07345678", "Gharbi", "Mohamed",
                LocalDate.of(1987, 12, 5), "m.gharbi@enterprise.tn", "+216 98 777 888",
                "8 Rue du Lac Biwa, Les Berges du Lac", "P-99001122", LocalDate.of(2030, 3, 10),
                CategorieClient.VIP, LocalDate.of(2022, 2, 1)));

        // 4. Client avec Permis Expiré (Non éligible - pour démonstration de règle métier)
        saveClientInternal(new Client(null, "11456789", "Mansouri", "Yassine",
                LocalDate.of(1992, 7, 18), "yassine.m@gmail.com", "+216 24 555 666",
                "22 Rue des Orangers, Sousse", "P-33445566", LocalDate.of(2023, 1, 1),
                CategorieClient.STANDARD, LocalDate.of(2024, 3, 15)));

        // 5. Client Jeune Conducteur (< 21 ans - Non éligible)
        saveClientInternal(new Client(null, "14567890", "Jaziri", "Nour",
                LocalDate.now().minusYears(19), "nour.jaziri@outlook.com", "+216 29 888 999",
                "5 Impasse Jasmin, La Marsa", "P-77889900", LocalDate.of(2029, 8, 12),
                CategorieClient.STANDARD, LocalDate.of(2024, 6, 1)));
    }

    private Client saveClientInternal(Client client) {
        if (client.getId() == null) {
            client.setId(idSequence.incrementAndGet());
        }
        clientsMap.put(client.getId(), client);
        return client;
    }

    public List<Client> findAll(String query) {
        if (query == null || query.trim().isEmpty()) {
            return clientsMap.values().stream()
                    .sorted(Comparator.comparing(Client::getId))
                    .collect(Collectors.toList());
        }
        String q = query.trim().toLowerCase();
        return clientsMap.values().stream()
                .filter(c -> (c.getNom() != null && c.getNom().toLowerCase().contains(q)) ||
                             (c.getPrenom() != null && c.getPrenom().toLowerCase().contains(q)) ||
                             (c.getCin() != null && c.getCin().toLowerCase().contains(q)) ||
                             (c.getEmail() != null && c.getEmail().toLowerCase().contains(q)))
                .sorted(Comparator.comparing(Client::getId))
                .collect(Collectors.toList());
    }

    public Optional<Client> findById(Long id) {
        return Optional.ofNullable(clientsMap.get(id));
    }

    public Optional<Client> findByCin(String cin) {
        return clientsMap.values().stream()
                .filter(c -> c.getCin() != null && c.getCin().equalsIgnoreCase(cin.trim()))
                .findFirst();
    }

    public Optional<Client> findByEmail(String email) {
        return clientsMap.values().stream()
                .filter(c -> c.getEmail() != null && c.getEmail().equalsIgnoreCase(email.trim()))
                .findFirst();
    }

    public Optional<Client> findByNumeroPermis(String numeroPermis) {
        return clientsMap.values().stream()
                .filter(c -> c.getNumeroPermis() != null && c.getNumeroPermis().equalsIgnoreCase(numeroPermis.trim()))
                .findFirst();
    }

    public Client save(Client client) {
        if (client.getId() == null) {
            client.setId(idSequence.incrementAndGet());
        }
        clientsMap.put(client.getId(), client);
        return client;
    }

    public boolean deleteById(Long id) {
        return clientsMap.remove(id) != null;
    }
}
