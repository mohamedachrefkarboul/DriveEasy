export type Carburant = 'ESSENCE' | 'DIESEL' | 'HYBRIDE' | 'ELECTRIQUE';
export type BoiteVitesse = 'MANUELLE' | 'AUTOMATIQUE';
export type StatutVehicule = 'DISPONIBLE' | 'LOUE' | 'MAINTENANCE';

export interface Vehicule {
  id?: number;
  immatriculation: string;
  marque: string;
  modele: string;
  annee: number;
  couleur: string;
  carburant: Carburant;
  boite: BoiteVitesse;
  nbPlaces: number;
  kilometrage: number;
  prixJournalier: number;
  statut: StatutVehicule;
  imageUrl?: string;
}
