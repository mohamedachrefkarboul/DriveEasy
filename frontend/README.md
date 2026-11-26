# Plateforme de Location de Véhicules : « DriveEasy » (Frontend Angular 22)

Bienvenue sur le dépôt du **Frontend Angular 22** de la plateforme **DriveEasy**, réalisé pour le projet web Spring Boot & Angular 22 (LIM3 B/C - Université SESAME).  
**Enseignant :** M. Karim Ben Romdhane.

---

## 1. Description du projet

Cette application web moderne en **Angular 22** (avec composants autonomes *Standalone Components* et **Tailwind CSS**) est destinée aux agents d'agence pour gérer le parc automobile, la clientèle et le cycle complet des locations.  
Elle consomme exclusivement l'**API Gateway** (`http://localhost:8080`), respectant la règle d'architecture interdisant toute communication directe avec les microservices métiers.

---

## 2. Pages et Écrans Réalisés

Conformément à la section 6.2 du cahier des charges :

| Écran | Route Angular | Contenu et fonctionnalités |
| :--- | :--- | :--- |
| **Tableau de bord** | `/dashboard` | Indicateurs clés : CA total, taux d'occupation, flotte disponible/louée/maintenance, top véhicules les plus loués. |
| **Catalogue véhicules** | `/vehicules` | Grille de cartes avec photos, filtres par énergie/statut/prix max, badge de disponibilité, actions modifier et maintenance. |
| **Formulaire véhicule** | `/vehicules/new` et `/vehicules/:id/edit` | Formulaire réactif avec validations strictes (immatriculation unique, prix > 0, année valide). |
| **Liste des clients** | `/clients` | Tableau des clients, recherche textuelle, badge de fidélité (**STANDARD**, **FIDELE**, **VIP**), alerte permis expiré. |
| **Fiche client** | `/clients/:id` | Informations complètes, diagnostic d'éligibilité en direct (vert si éligible, rouge sinon avec motif), historique des locations. |
| **Nouvelle location** | `/locations/new` | **Assistant en 4 étapes** : sélection client $\rightarrow$ période $\rightarrow$ véhicule disponible $\rightarrow$ simulation du prix en direct avec remise fidélité appliquée. |
| **Liste des locations** | `/locations` | Suivi des dossiers par statut (**RESERVEE**, **EN_COURS**, **TERMINEE**, **ANNULEE**), boutons de démarrage départ et retour. |
| **Retour de véhicule** | `/locations/:id/retour` | Saisie du kilométrage de retour, date effective, calcul des pénalités de retard (1.5 × tarif/j) et **reçu final imprimable**. |

---

## 3. Prérequis

- **Node.js** (v18.x, v20.x ou v22.x)
- **npm** (v9+) ou **pnpm** / **yarn**
- **Angular CLI** :
  ```bash
  npm install -g @angular/cli
  ```

---

## 4. Instructions d'Installation et Lancement

### Étape 1 : Installer les dépendances
À la racine de `driveeasy-frontend` :
```bash
npm install
```

### Étape 2 : Lancer le serveur de développement
```bash
npm start
# ou
ng serve --port 4200
```

### Étape 3 : Accéder à l'application
Ouvrez votre navigateur web à l'adresse :
```
http://localhost:4200
```

---

## 5. Intégration avec l'API Gateway

L'application envoie toutes ses requêtes HTTP vers l'API Gateway :
- **Passerelle :** `http://localhost:8080`
- **CORS :** La passerelle autorise explicitement l'origine `http://localhost:4200` avec méthodes `GET`, `POST`, `PUT`, `PATCH`, `DELETE`.

---

## 6. Comptes et Données de Démonstration

L'application est immédiatement exploitable grâce aux données préchargées :
- **Ahmed Ben Ali (Client 1) :** Standard, 31 ans, permis valide $\rightarrow$ **Éligible**
- **Sarra Trabelsi (Client 2) :** Fidèle, remise 5% $\rightarrow$ **Éligible**
- **Mohamed Gharbi (Client 3) :** VIP, remise 10% $\rightarrow$ **Éligible**
- **Yassine Mansouri (Client 4) :** Permis expiré en 2023 $\rightarrow$ **Inéligible (Alerte rouge)**
- **Nour Jaziri (Client 5) :** 19 ans $\rightarrow$ **Inéligible (Âge < 21 ans)**
