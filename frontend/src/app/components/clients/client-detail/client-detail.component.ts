import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ClientService } from '../../../services/client.service';
import { LocationService } from '../../../services/location.service';
import { Client, EligibiliteResponse } from '../../../models/client.model';
import { Location } from '../../../models/location.model';

@Component({
  selector: 'app-client-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="max-w-4xl mx-auto px-4 py-6 space-y-5">
      <div>
        <a routerLink="/clients" class="text-xs text-gray-500 hover:text-gray-900 flex items-center space-x-1 mb-2">
          <span>←</span>
          <span>Retour à la liste</span>
        </a>
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 class="text-xl font-bold text-gray-900">{{ client?.prenom }} {{ client?.nom }}</h1>
            <p class="text-xs text-gray-500 font-mono">CIN : {{ client?.cin }}</p>
          </div>
          <div class="mt-3 sm:mt-0">
            <a *ngIf="eligibilite?.eligible" [routerLink]="['/locations/new']" [queryParams]="{ clientId: client?.id }" class="bg-gray-900 hover:bg-gray-800 text-white text-xs font-medium px-3.5 py-1.5 rounded transition">
              + Nouvelle réservation
            </a>
          </div>
        </div>
      </div>

      <!-- Bloc Éligibilité & Fidélité -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Éligibilité -->
        <div class="md:col-span-2 p-4 rounded-lg border" [ngClass]="eligibilite?.eligible ? 'bg-gray-50 border-gray-300' : 'bg-red-50/50 border-red-200'">
          <span class="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
            Contrôle d'éligibilité
          </span>
          <h3 class="text-base font-bold mt-1" [ngClass]="eligibilite?.eligible ? 'text-gray-900' : 'text-red-900'">
            {{ eligibilite?.eligible ? 'Client Éligible' : 'Client Non Éligible' }}
          </h3>
          <p class="text-xs mt-1" [ngClass]="eligibilite?.eligible ? 'text-gray-700' : 'text-red-800'">
            {{ eligibilite?.motif }}
          </p>
          <div class="text-[11px] text-gray-500 mt-2">
            Âge : <span class="font-bold text-gray-800">{{ eligibilite?.age }} ans</span> | Permis valide : <span class="font-bold text-gray-800">{{ eligibilite?.permisValide ? 'Oui' : 'Non' }}</span>
          </div>
        </div>

        <!-- Fidélité -->
        <div class="bg-white p-4 rounded-lg border border-gray-200 flex flex-col justify-between">
          <div>
            <span class="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Statut Fidélité</span>
            <div class="mt-1">
              <span class="badge text-xs px-2.5 py-0.5" [ngClass]="{
                'badge-standard': client?.categorieClient === 'STANDARD',
                'badge-fidele': client?.categorieClient === 'FIDELE',
                'badge-vip': client?.categorieClient === 'VIP'
              }">
                {{ client?.categorieClient }}
              </span>
            </div>
            <p class="text-[11px] text-gray-500 mt-2">
              <span *ngIf="client?.categorieClient === 'STANDARD'">0% remise (Fidèle à 5 locations).</span>
              <span *ngIf="client?.categorieClient === 'FIDELE'">5% remise (VIP à 15 locations).</span>
              <span *ngIf="client?.categorieClient === 'VIP'">10% remise VIP accordée.</span>
            </p>
          </div>
          <div class="mt-2 text-[11px] text-gray-400">
            Locations terminées : <span class="font-bold text-gray-700">{{ totalLocationsTerminees }}</span>
          </div>
        </div>
      </div>

      <!-- Coordonnées et Permis -->
      <div class="bg-white rounded-lg border border-gray-200 p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div>
          <h3 class="font-bold text-gray-900 uppercase tracking-wider mb-2 text-[11px]">Coordonnées</h3>
          <p class="text-gray-700"><span class="text-gray-500">Email :</span> {{ client?.email }}</p>
          <p class="text-gray-700 mt-1"><span class="text-gray-500">Téléphone :</span> {{ client?.telephone }}</p>
          <p class="text-gray-700 mt-1"><span class="text-gray-500">Adresse :</span> {{ client?.adresse || 'N/A' }}</p>
          <p class="text-gray-700 mt-1"><span class="text-gray-500">Date de naissance :</span> {{ client?.dateNaissance }}</p>
        </div>
        <div>
          <h3 class="font-bold text-gray-900 uppercase tracking-wider mb-2 text-[11px]">Permis de Conduire</h3>
          <p class="text-gray-700 font-mono"><span class="text-gray-500 font-sans">Numéro :</span> {{ client?.numeroPermis }}</p>
          <p class="text-gray-700 mt-1"><span class="text-gray-500">Expiration :</span> {{ client?.dateExpirationPermis }}</p>
        </div>
      </div>

      <!-- Historique des locations -->
      <div class="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
        <h3 class="text-sm font-bold text-gray-900">Historique des locations</h3>

        <div *ngIf="locations.length; else noLocations" class="overflow-x-auto">
          <table class="w-full text-left text-xs text-gray-600">
            <thead class="bg-gray-50 text-gray-700 uppercase font-semibold border-b border-gray-200">
              <tr>
                <th class="py-2 px-2.5">ID</th>
                <th class="py-2 px-2.5">Véhicule</th>
                <th class="py-2 px-2.5">Période</th>
                <th class="py-2 px-2.5">Montant</th>
                <th class="py-2 px-2.5">Statut</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr *ngFor="let loc of locations" class="hover:bg-gray-50">
                <td class="py-2 px-2.5 font-mono">#{{ loc.id }}</td>
                <td class="py-2 px-2.5 font-medium text-gray-900">Véhicule #{{ loc.vehiculeId }}</td>
                <td class="py-2 px-2.5">{{ loc.dateDebut }} au {{ loc.dateFinPrevue }}</td>
                <td class="py-2 px-2.5 font-medium text-gray-900">{{ loc.montantTotal | number:'1.2-2' }} TND</td>
                <td class="py-2 px-2.5">
                  <span class="badge text-[10px]" [ngClass]="{
                    'badge-disponible': loc.statut === 'TERMINEE',
                    'badge-loue': loc.statut === 'EN_COURS',
                    'badge-standard': loc.statut === 'RESERVEE',
                    'badge-maintenance': loc.statut === 'ANNULEE'
                  }">
                    {{ loc.statut }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <ng-template #noLocations>
          <p class="text-xs text-gray-400 py-2">Aucune location enregistrée pour ce client.</p>
        </ng-template>
      </div>
    </div>
  `
})
export class ClientDetailComponent implements OnInit {
  client?: Client;
  eligibilite?: EligibiliteResponse;
  locations: Location[] = [];
  totalLocationsTerminees = 0;

  constructor(
    private route: ActivatedRoute,
    private clientService: ClientService,
    private locationService: LocationService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.clientService.getById(id).subscribe({
        next: (c) => (this.client = c),
        error: (err) => console.error(err)
      });

      this.clientService.checkEligibilite(id).subscribe({
        next: (e) => (this.eligibilite = e),
        error: (err) => console.error(err)
      });

      this.locationService.getAll(undefined, id).subscribe({
        next: (res) => {
          this.locations = res.content || [];
          this.totalLocationsTerminees = this.locations.filter((l) => l.statut === 'TERMINEE').length;
        },
        error: (err) => console.error(err)
      });
    }
  }
}
