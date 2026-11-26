# Plateforme de Location de Véhicules : « DriveEasy » (Backend)

Bienvenue sur le dépôt du **Backend Microservices** de la plateforme **DriveEasy**, réalisé dans le cadre du module *Développement d'applications web et multimédia (J2EE, .Net..)* - LIM3 B/C à l'Université SESAME.  
**Enseignant :** M. Karim Ben Romdhane.

---

## 1. Description du projet

DriveEasy est une solution moderne de location de véhicules reposant sur une architecture microservices avec **Spring Boot 3.x** et **Spring Cloud**.  
L'application permet :
- La gestion du parc automobile (disponibilité, caractéristiques, kilométrage).
- La gestion des clients et la vérification automatisée de l'éligibilité (âge $\ge$ 21 ans et permis valide).
- Le cycle de vie complet des locations (réservation, départ avec véhicule loué, retour avec pénalités de retard et réintégration du véhicule).
- L'attribution automatique des catégories de fidélité (**FIDELE** à 5 locations, **VIP** à 15 locations) avec remises calculées automatiquement.
- Le suivi en temps réel via indicateurs (chiffre d'affaires, taux d'occupation du parc, top véhicules).

> **Important (Section 4.3 du cahier des charges) :**  
> Conformément au sujet, **les données sont chargées et gérées exclusivement en mémoire vive (RAM)** (interdiction stricte de bases de données persistantes). Tous les microservices utilisent des repositories thread-safe préchargés avec des jeux de données réalistes.

---

## 2. Architecture & Ports des composants

| Composant | Technologie | Port | Description |
| :--- | :--- | :--- | :--- |
| **Service Registry** | Spring Cloud Netflix Eureka | `8761` | Annuaire et découverte dynamique |
| **Config Server** | Spring Cloud Config Server | `8888` | Configuration centralisée (profil native) |
| **vehicule-service** | Spring Boot Web / Actuator | `8081` | Parc automobile et disponibilité |
| **client-service** | Spring Boot Web / Actuator | `8082` | Gestion clients et éligibilité du permis |
| **location-service** | Spring Boot / OpenFeign | `8083` | Orchestration, cycle de location, calculs |
| **API Gateway** | Spring Cloud Gateway | `8080` | Point d'entrée unique, CORS et filtres de traçage |
| **Monitoring (Zipkin)** | Docker / OpenZipkin | `9411` | Traçage distribué des requêtes |

---

## 3. Prérequis

- **Java JDK 17 ou 21**
- **Apache Maven 3.8+**
- **Docker & Docker Compose** (pour Zipkin)

---

## 4. Instructions de lancement pas-à-pas

### Étape 0 : Démarrer le serveur Zipkin (Traçage distribué)
```bash
docker compose up -d
```
> Zipkin est alors accessible sur : `http://localhost:9411`

### Étape 1 : Compiler l'ensemble des modules Maven
À la racine de `driveeasy-backend` :
```bash
mvn clean install -DskipTests
```

### Étape 2 : Démarrage des microservices dans l'ordre recommandé

Ouvrez des terminaux séparés pour chaque service :

1. **Service Registry (Eureka) [Port 8761] :**
   ```bash
   cd service-registry
   mvn spring-boot:run
   ```
   *Vérification :* Ouvrez `http://localhost:8761` dans votre navigateur.

2. **Config Server [Port 8888] :**
   ```bash
   cd config-server
   mvn spring-boot:run
   ```
   *Vérification :* Ouvrez `http://localhost:8888/vehicule-service/default`.

3. **Microservices métier :**
   - **vehicule-service [Port 8081] :**
     ```bash
     cd vehicule-service
     mvn spring-boot:run
     ```
   - **client-service [Port 8082] :**
     ```bash
     cd client-service
     mvn spring-boot:run
     ```
   - **location-service [Port 8083] :**
     ```bash
     cd location-service
     mvn spring-boot:run
     ```

4. **API Gateway [Port 8080] :**
   ```bash
   cd api-gateway
   mvn spring-boot:run
   ```

---

## 5. Routage via l'API Gateway

Toutes les requêtes passent par la passerelle unique `http://localhost:8080` :

| Préfixe Gateway | Service Cible | Filtre appliqué |
| :--- | :--- | :--- |
| `http://localhost:8080/api/vehicules/**` | `vehicule-service` (8081) | `StripPrefix=1` |
| `http://localhost:8080/api/clients/**` | `client-service` (8082) | `StripPrefix=1` |
| `http://localhost:8080/api/locations/**` | `location-service` (8083) | `StripPrefix=1` |

---

## 6. Jeux de données préchargés (Démonstration en RAM)

### Véhicules (`/api/vehicules`) :
1. **Peugeot 208** (210-TN-4521) - DISPONIBLE - 85.00 TND/j - Essence - Manuelle
2. **Renault Clio 5** (225-TN-7890) - DISPONIBLE - 75.00 TND/j - Diesel - Manuelle
3. **Volkswagen Golf 8** (230-TN-1122) - DISPONIBLE - 130.00 TND/j - Essence - Automatique
4. **Toyota Yaris Hybride** (215-TN-3344) - LOUE - 95.00 TND/j - Hybride - Automatique
5. **Tesla Model 3** (240-TN-5566) - DISPONIBLE - 190.00 TND/j - Électrique - Automatique
6. **Hyundai Tucson** (198-TN-9988) - MAINTENANCE - 150.00 TND/j - Diesel - Automatique

### Clients (`/api/clients`) :
1. **Ahmed Ben Ali** (CIN: 08123456) - Catégorie: `STANDARD` - Permis valide (2028) - Éligible
2. **Sarra Trabelsi** (CIN: 09234567) - Catégorie: `FIDELE` (5% remise) - Permis valide (2029) - Éligible
3. **Mohamed Gharbi** (CIN: 07345678) - Catégorie: `VIP` (10% remise) - Permis valide (2030) - Éligible
4. **Yassine Mansouri** (CIN: 11456789) - Catégorie: `STANDARD` - Permis expiré (2023) - **Non éligible**
5. **Nour Jaziri** (CIN: 14567890) - Catégorie: `STANDARD` - 19 ans (< 21 ans) - **Non éligible**

---

## 7. Scénarios de tests rapides (cURL / Postman)

### 1. Consulter les véhicules disponibles :
```bash
curl -X GET "http://localhost:8080/api/vehicules/disponibles"
```

### 2. Vérifier l'éligibilité d'un client :
```bash
# Client 1 (Éligible : > 21 ans et permis valide)
curl -X GET "http://localhost:8080/api/clients/1/eligibilite"

# Client 4 (Inéligible : Permis expiré)
curl -X GET "http://localhost:8080/api/clients/4/eligibilite"
```

### 3. Simuler le prix d'une location :
```bash
curl -X POST "http://localhost:8080/api/locations/simulation" \
     -H "Content-Type: application/json" \
     -d '{
       "clientId": 2,
       "vehiculeId": 1,
       "dateDebut": "2026-12-01",
       "dateFinPrevue": "2026-12-05"
     }'
```

### 4. Créer une réservation :
```bash
curl -X POST "http://localhost:8080/api/locations" \
     -H "Content-Type: application/json" \
     -d '{
       "clientId": 1,
       "vehiculeId": 2,
       "dateDebut": "2026-12-10",
       "dateFinPrevue": "2026-12-15"
     }'
```

### 5. Démarrer une location (Statut passe à EN_COURS, véhicule passe à LOUE) :
```bash
curl -X PATCH "http://localhost:8080/api/locations/3/depart"
```

### 6. Clôturer un retour avec calcul de retard et pénalités :
```bash
curl -X PATCH "http://localhost:8080/api/locations/2/retour" \
     -H "Content-Type: application/json" \
     -d '{
       "kmRetour": 21200.0,
       "dateRetourEffectif": "2026-12-03"
     }'
```

### 7. Obtenir les statistiques globales (CA, taux d'occupation, top véhicules) :
```bash
curl -X GET "http://localhost:8080/api/locations/statistiques"
```

---

## 8. Traçage distribué (Zipkin)
Pour observer une trace complète `API Gateway -> location-service -> client-service & vehicule-service` :
1. Envoyez une requête de création ou de simulation de location via `http://localhost:8080/api/locations`.
2. Ouvrez l'interface Zipkin sur `http://localhost:9411/zipkin/`.
3. Cliquez sur **Run Query** pour visualiser l'arbre de span, les temps d'exécution et les appels Feign inter-services.
