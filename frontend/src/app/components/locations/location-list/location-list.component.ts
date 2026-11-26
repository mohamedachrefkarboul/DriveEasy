import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LocationService } from '../../../services/location.service';
import { Location, StatutLocation } from '../../../models/location.model';

@Component({
  selector: 'app-location-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      <!-- En-tête -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-4">
        <div>
          <h1 class="text-xl font-bold text-gray-900">Locations</h1>
          <p class="text-xs text-gray-500 mt-0.5">Suivi des dossiers et du cycle de location</p>
        </div>
        <div class="mt-3 sm:mt-0">
          <a routerLink="/locations/new" class="bg-gray-900 hover:bg-gray-800 text-white px-3.5 py-1.5 rounded text-xs font-medium transition">
            + Nouvelle Réservation
          </a>
        </div>
      </div>

      <!-- Filtres -->
      <div class="bg-white p-3 rounded-lg border border-gray-200 flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <label class="text-xs font-medium text-gray-700">Filtrer par statut :</label>
          <select [(ngModel)]="filtreStatut" (change)="chargerLocations()" class="text-xs border border-gray-300 rounded p-1 bg-white text-gray-700">
            <option value="">Tous les statuts</option>
            <option value="RESERVEE">Réservée</option>
            <option value="EN_COURS">En cours (Départ effectué)</option>
            <option value="TERMINEE">Terminée (Clôturée)</option>
            <option value="ANNULEE">Annulée</option>
          </select>
        </div>

        <button (click)="filtreStatut = ''; vehiculeFiltreId = undefined; chargerLocations()" class="text-xs text-gray-500 hover:text-gray-800">
          Réinitialiser filtres
        </button>
      </div>

      <!-- Message -->
      <div *ngIf="message" [ngClass]="messageType === 'success' ? 'bg-gray-100 text-gray-900 border-gray-300' : 'bg-red-50 text-red-800 border-red-200'" class="p-2.5 rounded border text-xs">
        {{ message }}
      </div>

      <!-- Tableau des locations -->
      <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-gray-600">
            <thead class="bg-gray-50 text-gray-700 uppercase font-semibold border-b border-gray-200">
              <tr>
                <th class="py-2.5 px-3">Dossier</th>
                <th class="py-2.5 px-3">Client</th>
                <th class="py-2.5 px-3">Véhicule</th>
                <th class="py-2.5 px-3">Période</th>
                <th class="py-2.5 px-3">Statut</th>
                <th class="py-2.5 px-3">Montant</th>
                <th class="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr *ngFor="let loc of locations" class="hover:bg-gray-50">
                <td class="py-2.5 px-3 font-mono font-bold text-gray-900">
                  #{{ loc.id }}
                </td>
                <td class="py-2.5 px-3">
                  <a [routerLink]="['/clients', loc.clientId]" class="text-gray-900 hover:underline font-medium">
                    Client #{{ loc.clientId }}
                  </a>
                </td>
                <td class="py-2.5 px-3">
                  <span class="text-gray-700">Véhicule #{{ loc.vehiculeId }}</span>
                </td>
                <td class="py-2.5 px-3">
                  <div>{{ loc.dateDebut }} au {{ loc.dateFinPrevue }}</div>
                </td>
                <td class="py-2.5 px-3">
                  <span class="badge text-[11px]" [ngClass]="{
                    'badge-disponible': loc.statut === 'TERMINEE',
                    'badge-loue': loc.statut === 'EN_COURS',
                    'badge-standard': loc.statut === 'RESERVEE',
                    'badge-maintenance': loc.statut === 'ANNULEE'
                  }">
                    {{ loc.statut }}
                  </span>
                </td>
                <td class="py-2.5 px-3">
                  <span class="font-bold text-gray-900">{{ loc.montantTotal | number:'1.2-2' }} TND</span>
                  <div *ngIf="loc.penalite && loc.penalite > 0" class="text-[10px] text-red-600 font-semibold">
                    Dont {{ loc.penalite | number:'1.2-2' }} TND pénalités
                  </div>
                </td>
                <td class="py-2.5 px-3 text-right space-x-2">
                  <button *ngIf="loc.statut === 'RESERVEE'" (click)="demarrer(loc)" class="px-2 py-1 bg-gray-900 hover:bg-gray-800 text-white rounded text-[11px]">
                    Départ
                  </button>
                  <a *ngIf="loc.statut === 'EN_COURS'" [routerLink]="['/locations', loc.id, 'retour']" class="px-2 py-1 bg-gray-900 hover:bg-gray-800 text-white rounded text-[11px]">
                    Retour
                  </a>
                  <a *ngIf="loc.statut === 'TERMINEE'" [routerLink]="['/locations', loc.id, 'retour']" class="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300 rounded text-[11px]">
                    Reçu
                  </a>
                  <button *ngIf="loc.statut === 'RESERVEE'" (click)="annuler(loc)" class="text-red-700 hover:underline text-[11px]">
                    Annuler
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class LocationListComponent implements OnInit {
  locations: Location[] = [];
  filtreStatut: StatutLocation | '' = '';
  vehiculeFiltreId?: number;
  message = '';
  messageType: 'success' | 'error' = 'success';

  constructor(
    private route: ActivatedRoute,
    private locationService: LocationService
  ) {}

  ngOnInit(): void {
    const vId = this.route.snapshot.queryParams['vehiculeId'];
    if (vId) this.vehiculeFiltreId = Number(vId);
    this.chargerLocations();
  }

  chargerLocations(): void {
    const stat = this.filtreStatut ? this.filtreStatut : undefined;
    this.locationService.getAll(stat, undefined, this.vehiculeFiltreId).subscribe({
      next: (res) => (this.locations = res.content || []),
      error: (err) => console.error(err)
    });
  }

  demarrer(loc: Location): void {
    if (!loc.id) return;
    if (confirm(`Confirmer le départ pour le dossier #${loc.id} ? Le véhicule passera au statut LOUÉ.`)) {
      this.locationService.demarrer(loc.id).subscribe({
        next: () => {
          this.message = `Départ validé pour la location #${loc.id}`;
          this.messageType = 'success';
          this.chargerLocations();
          setTimeout(() => (this.message = ''), 4000);
        },
        error: (err) => {
          this.message = err.error?.message || 'Erreur lors du départ';
          this.messageType = 'error';
        }
      });
    }
  }

  annuler(loc: Location): void {
    if (!loc.id) return;
    if (confirm(`Annuler la réservation #${loc.id} ?`)) {
      this.locationService.annuler(loc.id).subscribe({
        next: () => {
          this.message = `Réservation #${loc.id} annulée.`;
          this.messageType = 'success';
          this.chargerLocations();
        },
        error: (err) => {
          this.message = err.error?.message || 'Erreur lors de l\'annulation';
          this.messageType = 'error';
        }
      });
    }
  }
}
