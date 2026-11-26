import { Vehicule } from './vehicule.model';
import { Client } from './client.model';

export type StatutLocation = 'RESERVEE' | 'EN_COURS' | 'TERMINEE' | 'ANNULEE';

export interface Location {
  id?: number;
  clientId: number;
  vehiculeId: number;
  dateDebut: string;
  dateFinPrevue: string;
  dateRetourEffectif?: string;
  kmDepart?: number;
  kmRetour?: number;
  prixJournalierApplique: number;
  montantTotal: number;
  penalite?: number;
  statut: StatutLocation;
  dateCreation?: string;
}

export interface LocationDetail {
  location: Location;
  client?: Client;
  vehicule?: Vehicule;
}

export interface SimulationRequest {
  clientId: number;
  vehiculeId: number;
  dateDebut: string;
  dateFinPrevue: string;
}

export interface SimulationResponse {
  nbJours: number;
  prixJournalier: number;
  montantBase: number;
  categorieClient: string;
  remisePourcentage: number;
  montantRemise: number;
  montantTotal: number;
}

export interface Statistiques {
  chiffreAffairesTotal: number;
  nombreLocationsTotal: number;
  nombreLocationsEnCours: number;
  nombreLocationsTerminees: number;
  tauxOccupation: number;
  topVehicules: Array<{
    vehiculeId: number;
    locationsCount: number;
    immatriculation?: string;
    marque?: string;
    modele?: string;
  }>;
}
