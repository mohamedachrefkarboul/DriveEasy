import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LocationService } from '../../services/location.service';
import { VehiculeService } from '../../services/vehicule.service';
import { Statistiques } from '../../models/location.model';
import { Vehicule } from '../../models/vehicule.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <!-- En-tête -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-4">
        <div>
          <h1 class="text-xl font-bold text-gray-900">Tableau de bord</h1>
          <p class="text-xs text-gray-500 mt-0.5">Plateforme de gestion de location de véhicules</p>
        </div>
        <div class="mt-3 sm:mt-0">
          <a routerLink="/locations/new" class="bg-gray-900 hover:bg-gray-800 text-white px-3.5 py-1.5 rounded text-xs font-medium transition">
            Créer une réservation
          </a>
        </div>
      </div>

      <!-- Cartes indicateurs -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white p-4 rounded-lg border border-gray-200">
          <span class="text-xs font-medium text-gray-500 uppercase tracking-wide">Chiffre d'affaires</span>
          <p class="text-2xl font-bold text-gray-900 mt-1">{{ (stats?.chiffreAffairesTotal || 0) | number:'1.2-2' }} <span class="text-xs font-normal text-gray-400">TND</span></p>
          <p class="text-[11px] text-gray-500 mt-1">Total des locations</p>
        </div>

        <div class="bg-white p-4 rounded-lg border border-gray-200">
          <span class="text-xs font-medium text-gray-500 uppercase tracking-wide">Taux d'occupation</span>
          <p class="text-2xl font-bold text-gray-900 mt-1">{{ stats?.tauxOccupation || 0 }} %</p>
          <div class="w-full bg-gray-100 rounded-full h-1.5 mt-2">
            <div class="bg-gray-800 h-1.5 rounded-full" [style.width.%]="stats?.tauxOccupation || 0"></div>
          </div>
        </div>

        <div class="bg-white p-4 rounded-lg border border-gray-200">
          <span class="text-xs font-medium text-gray-500 uppercase tracking-wide">Locations en cours</span>
          <p class="text-2xl font-bold text-gray-900 mt-1">{{ stats?.nombreLocationsEnCours || 0 }}</p>
          <p class="text-[11px] text-gray-500 mt-1">Véhicules loués</p>
        </div>

        <div class="bg-white p-4 rounded-lg border border-gray-200">
          <span class="text-xs font-medium text-gray-500 uppercase tracking-wide">Total dossiers</span>
          <p class="text-2xl font-bold text-gray-900 mt-1">{{ stats?.nombreLocationsTotal || 0 }}</p>
          <p class="text-[11px] text-gray-500 mt-1">{{ stats?.nombreLocationsTerminees || 0 }} terminées</p>
        </div>
      </div>

      <!-- État du parc & Top Véhicules -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <!-- Répartition de la flotte -->
        <div class="bg-white p-5 rounded-lg border border-gray-200 lg:col-span-1">
          <h2 class="text-sm font-semibold text-gray-900 mb-3">Statut de la flotte</h2>
          <div class="space-y-2.5">
            <div class="flex justify-between items-center p-2.5 bg-gray-50 rounded border border-gray-200">
              <span class="text-xs font-medium text-gray-700">Disponibles</span>
              <span class="font-bold text-gray-900 text-sm">{{ nbDisponibles }}</span>
            </div>

            <div class="flex justify-between items-center p-2.5 bg-gray-50 rounded border border-gray-200">
              <span class="text-xs font-medium text-gray-700">En location</span>
              <span class="font-bold text-gray-900 text-sm">{{ nbLoues }}</span>
            </div>

            <div class="flex justify-between items-center p-2.5 bg-gray-50 rounded border border-gray-200">
              <span class="text-xs font-medium text-gray-700">En maintenance</span>
              <span class="font-bold text-gray-900 text-sm">{{ nbMaintenance }}</span>
            </div>
          </div>

          <div class="mt-4 pt-3 border-t border-gray-100">
            <a routerLink="/vehicules" class="text-xs text-gray-700 hover:text-gray-900 font-medium flex items-center justify-between">
              <span>Voir le parc complet</span>
              <span>→</span>
            </a>
          </div>
        </div>

        <!-- Top Véhicules les plus loués -->
        <div class="bg-white p-5 rounded-lg border border-gray-200 lg:col-span-2">
          <div class="flex items-center justify-between mb-3">
            <h2 class="text-sm font-semibold text-gray-900">Véhicules les plus loués</h2>
            <span class="text-[11px] text-gray-400">Historique des locations</span>
          </div>

          <div *ngIf="stats?.topVehicules?.length; else emptyTop" class="overflow-x-auto">
            <table class="w-full text-left text-xs text-gray-600">
              <thead class="bg-gray-50 text-gray-700 uppercase font-semibold border-b border-gray-200">
                <tr>
                  <th class="py-2.5 px-3">Véhicule</th>
                  <th class="py-2.5 px-3">Immatriculation</th>
                  <th class="py-2.5 px-3 text-center">Locations</th>
                  <th class="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr *ngFor="let item of stats?.topVehicules" class="hover:bg-gray-50">
                  <td class="py-2.5 px-3 font-medium text-gray-900">
                    {{ item.marque || 'Véhicule #' + item.vehiculeId }} {{ item.modele || '' }}
                  </td>
                  <td class="py-2.5 px-3">
                    <span class="font-mono text-[11px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-700 border border-gray-200">{{ item.immatriculation || 'ID: ' + item.vehiculeId }}</span>
                  </td>
                  <td class="py-2.5 px-3 text-center font-bold text-gray-900">
                    {{ item.locationsCount }}
                  </td>
                  <td class="py-2.5 px-3 text-right">
                    <a [routerLink]="['/locations']" [queryParams]="{ vehiculeId: item.vehiculeId }" class="text-gray-600 hover:text-gray-900 hover:underline">
                      Voir
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <ng-template #emptyTop>
            <div class="text-center py-6 text-gray-400 text-xs">
              Aucune donnée statistique enregistrée.
            </div>
          </ng-template>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  stats: Statistiques | null = null;
  vehicules: Vehicule[] = [];
  nbDisponibles = 0;
  nbLoues = 0;
  nbMaintenance = 0;

  constructor(
    private locationService: LocationService,
    private vehiculeService: VehiculeService
  ) {}

  ngOnInit(): void {
    this.chargerDonnees();
  }

  chargerDonnees(): void {
    this.locationService.getStatistiques().subscribe({
      next: (data) => (this.stats = data),
      error: (err) => console.error(err)
    });

    this.vehiculeService.getAll().subscribe({
      next: (list) => {
        this.vehicules = list;
        this.nbDisponibles = list.filter((v) => v.statut === 'DISPONIBLE').length;
        this.nbLoues = list.filter((v) => v.statut === 'LOUE').length;
        this.nbMaintenance = list.filter((v) => v.statut === 'MAINTENANCE').length;
      },
      error: (err) => console.error(err)
    });
  }
}
