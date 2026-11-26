import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { VehiculeService } from '../../../services/vehicule.service';
import { Vehicule, Carburant, StatutVehicule } from '../../../models/vehicule.model';

@Component({
  selector: 'app-vehicule-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      <!-- En-tête -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-4">
        <div>
          <h1 class="text-xl font-bold text-gray-900">Parc Automobile</h1>
          <p class="text-xs text-gray-500 mt-0.5">Catalogue des véhicules enregistrés</p>
        </div>
        <div class="mt-3 sm:mt-0">
          <a routerLink="/vehicules/new" class="bg-gray-900 hover:bg-gray-800 text-white px-3.5 py-1.5 rounded text-xs font-medium transition">
            + Ajouter un véhicule
          </a>
        </div>
      </div>

      <!-- Filtres -->
      <div class="bg-white p-3.5 rounded-lg border border-gray-200 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">Carburant</label>
          <select [(ngModel)]="filtreCarburant" (change)="filtrer()" class="w-full text-xs border border-gray-300 rounded p-1.5 bg-white text-gray-700">
            <option value="">Tous les carburants</option>
            <option value="ESSENCE">Essence</option>
            <option value="DIESEL">Diesel</option>
            <option value="HYBRIDE">Hybride</option>
            <option value="ELECTRIQUE">Électrique</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">Statut</label>
          <select [(ngModel)]="filtreStatut" (change)="filtrer()" class="w-full text-xs border border-gray-300 rounded p-1.5 bg-white text-gray-700">
            <option value="">Tous les statuts</option>
            <option value="DISPONIBLE">Disponible</option>
            <option value="LOUE">Loué</option>
            <option value="MAINTENANCE">Maintenance</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">Prix max (TND)</label>
          <input type="number" [(ngModel)]="filtrePrixMax" (input)="filtrer()" placeholder="Ex: 150" class="w-full text-xs border border-gray-300 rounded p-1.5 bg-white text-gray-700" />
        </div>

        <div>
          <button (click)="reinitialiserFiltres()" class="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs py-1.5 rounded border border-gray-300 transition">
            Réinitialiser
          </button>
        </div>
      </div>

      <!-- Message -->
      <div *ngIf="message" [ngClass]="messageType === 'success' ? 'bg-gray-100 text-gray-900 border-gray-300' : 'bg-red-50 text-red-800 border-red-200'" class="p-2.5 rounded border text-xs">
        {{ message }}
      </div>

      <!-- Grille des véhicules -->
      <div *ngIf="vehicules.length; else aucunVehicule" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div *ngFor="let v of vehicules" class="bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col hover:border-gray-400 transition">
          <div class="h-40 bg-gray-100 relative">
            <img [src]="v.imageUrl || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600'" [alt]="v.marque + ' ' + v.modele" class="w-full h-full object-cover" />
            <div class="absolute top-2.5 right-2.5">
              <span class="badge" [ngClass]="{
                'badge-disponible': v.statut === 'DISPONIBLE',
                'badge-loue': v.statut === 'LOUE',
                'badge-maintenance': v.statut === 'MAINTENANCE'
              }">
                {{ v.statut }}
              </span>
            </div>
            <div class="absolute bottom-2 left-2 bg-gray-900/90 text-white font-mono text-[11px] px-1.5 py-0.5 rounded">
              {{ v.immatriculation }}
            </div>
          </div>

          <div class="p-4 flex-1 flex flex-col justify-between">
            <div>
              <div class="flex justify-between items-start">
                <div>
                  <h3 class="text-sm font-bold text-gray-900">{{ v.marque }} {{ v.modele }}</h3>
                  <p class="text-xs text-gray-500">{{ v.annee }} • {{ v.couleur }}</p>
                </div>
                <div class="text-right">
                  <p class="text-base font-bold text-gray-900">{{ v.prixJournalier | number:'1.2-2' }}</p>
                  <p class="text-[10px] text-gray-400">TND / jour</p>
                </div>
              </div>

              <div class="grid grid-cols-3 gap-2 my-3 text-[11px] text-gray-600 text-center bg-gray-50 p-2 rounded border border-gray-100">
                <div>
                  <span class="block text-gray-400">Boîte</span>
                  <span class="font-medium text-gray-800">{{ v.boite }}</span>
                </div>
                <div>
                  <span class="block text-gray-400">Énergie</span>
                  <span class="font-medium text-gray-800">{{ v.carburant }}</span>
                </div>
                <div>
                  <span class="block text-gray-400">Places</span>
                  <span class="font-medium text-gray-800">{{ v.nbPlaces }}</span>
                </div>
              </div>

              <div class="text-xs text-gray-500">
                Compteur : <span class="font-medium text-gray-800">{{ v.kilometrage | number }} km</span>
              </div>
            </div>

            <div class="mt-4 pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs">
              <a [routerLink]="['/vehicules', v.id, 'edit']" class="text-gray-700 hover:text-black font-medium underline">
                Modifier
              </a>

              <div class="flex items-center space-x-2">
                <button *ngIf="v.statut !== 'MAINTENANCE' && v.statut !== 'LOUE'" (click)="changerStatut(v, 'MAINTENANCE')" class="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded border border-gray-200">
                  Maintenance
                </button>
                <button *ngIf="v.statut === 'MAINTENANCE'" (click)="changerStatut(v, 'DISPONIBLE')" class="px-2 py-1 bg-gray-900 hover:bg-gray-800 text-white rounded">
                  Remettre en service
                </button>
                <button (click)="supprimer(v)" class="text-red-700 hover:underline">
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ng-template #aucunVehicule>
        <div class="bg-white p-8 text-center rounded-lg border border-gray-200">
          <p class="text-gray-500 text-xs">Aucun véhicule trouvé.</p>
        </div>
      </ng-template>
    </div>
  `
})
export class VehiculeListComponent implements OnInit {
  vehicules: Vehicule[] = [];
  filtreCarburant: Carburant | '' = '';
  filtreStatut: StatutVehicule | '' = '';
  filtrePrixMax?: number;

  message = '';
  messageType: 'success' | 'error' = 'success';

  constructor(private vehiculeService: VehiculeService) {}

  ngOnInit(): void {
    this.filtrer();
  }

  filtrer(): void {
    const carb = this.filtreCarburant ? this.filtreCarburant : undefined;
    const stat = this.filtreStatut ? this.filtreStatut : undefined;
    this.vehiculeService.getAll(carb, stat, this.filtrePrixMax).subscribe({
      next: (data) => (this.vehicules = data),
      error: (err) => console.error(err)
    });
  }

  reinitialiserFiltres(): void {
    this.filtreCarburant = '';
    this.filtreStatut = '';
    this.filtrePrixMax = undefined;
    this.filtrer();
  }

  changerStatut(v: Vehicule, nouveauStatut: StatutVehicule): void {
    if (!v.id) return;
    this.vehiculeService.updateStatut(v.id, nouveauStatut).subscribe({
      next: () => {
        this.afficherMessage(`Statut de ${v.immatriculation} : ${nouveauStatut}`, 'success');
        this.filtrer();
      },
      error: (err) => this.afficherMessage(err.error?.message || 'Erreur lors du changement de statut', 'error')
    });
  }

  supprimer(v: Vehicule): void {
    if (!v.id) return;
    if (v.statut === 'LOUE') {
      this.afficherMessage('Erreur : Impossible de supprimer un véhicule actuellement loué.', 'error');
      return;
    }
    if (confirm(`Confirmer la suppression du véhicule ${v.immatriculation} ?`)) {
      this.vehiculeService.delete(v.id).subscribe({
        next: () => {
          this.afficherMessage('Véhicule supprimé.', 'success');
          this.filtrer();
        },
        error: (err) => this.afficherMessage(err.error?.message || 'Erreur lors de la suppression', 'error')
      });
    }
  }

  private afficherMessage(msg: string, type: 'success' | 'error'): void {
    this.message = msg;
    this.messageType = type;
    setTimeout(() => (this.message = ''), 4000);
  }
}
