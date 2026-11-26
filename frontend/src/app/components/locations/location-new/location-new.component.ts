import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClientService } from '../../../services/client.service';
import { VehiculeService } from '../../../services/vehicule.service';
import { LocationService } from '../../../services/location.service';
import { Client, EligibiliteResponse } from '../../../models/client.model';
import { Vehicule } from '../../../models/vehicule.model';
import { SimulationResponse } from '../../../models/location.model';

@Component({
  selector: 'app-location-new',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="max-w-3xl mx-auto px-4 py-6 space-y-5">
      <!-- En-tête -->
      <div>
        <a routerLink="/locations" class="text-xs text-gray-500 hover:text-gray-900 flex items-center space-x-1 mb-2">
          <span>←</span>
          <span>Retour aux locations</span>
        </a>
        <h1 class="text-xl font-bold text-gray-900">Nouvelle Réservation</h1>
        <p class="text-xs text-gray-500">Assistant de création de location en 4 étapes</p>
      </div>

      <!-- Stepper simple -->
      <div class="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 text-xs">
        <div class="flex items-center space-x-1.5" [ngClass]="step >= 1 ? 'text-gray-900 font-bold' : 'text-gray-400'">
          <span class="w-5 h-5 rounded-full flex items-center justify-center border text-[11px]" [ngClass]="step >= 1 ? 'border-gray-900 bg-gray-100' : 'border-gray-300'">1</span>
          <span>Client</span>
        </div>
        <div class="w-6 h-px bg-gray-200"></div>

        <div class="flex items-center space-x-1.5" [ngClass]="step >= 2 ? 'text-gray-900 font-bold' : 'text-gray-400'">
          <span class="w-5 h-5 rounded-full flex items-center justify-center border text-[11px]" [ngClass]="step >= 2 ? 'border-gray-900 bg-gray-100' : 'border-gray-300'">2</span>
          <span>Période</span>
        </div>
        <div class="w-6 h-px bg-gray-200"></div>

        <div class="flex items-center space-x-1.5" [ngClass]="step >= 3 ? 'text-gray-900 font-bold' : 'text-gray-400'">
          <span class="w-5 h-5 rounded-full flex items-center justify-center border text-[11px]" [ngClass]="step >= 3 ? 'border-gray-900 bg-gray-100' : 'border-gray-300'">3</span>
          <span>Véhicule</span>
        </div>
        <div class="w-6 h-px bg-gray-200"></div>

        <div class="flex items-center space-x-1.5" [ngClass]="step >= 4 ? 'text-gray-900 font-bold' : 'text-gray-400'">
          <span class="w-5 h-5 rounded-full flex items-center justify-center border text-[11px]" [ngClass]="step >= 4 ? 'border-gray-900 bg-gray-100' : 'border-gray-300'">4</span>
          <span>Validation</span>
        </div>
      </div>

      <!-- Erreurs -->
      <div *ngIf="errorMessage" class="p-2.5 bg-red-50 text-red-800 border border-red-200 rounded text-xs">
        {{ errorMessage }}
      </div>

      <!-- Étape 1 : Client -->
      <div *ngIf="step === 1" class="bg-white p-5 rounded-lg border border-gray-200 space-y-4">
        <h2 class="text-sm font-bold text-gray-900">Étape 1 : Sélectionner le client</h2>

        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">Client :</label>
          <select [(ngModel)]="selectedClientId" (change)="onClientChange()" class="w-full text-xs border border-gray-300 rounded p-2 bg-white text-gray-800">
            <option [ngValue]="null">-- Sélectionner un client --</option>
            <option *ngFor="let c of clients" [ngValue]="c.id">
              {{ c.prenom }} {{ c.nom }} (CIN: {{ c.cin }}) - Catégorie : {{ c.categorieClient }}
            </option>
          </select>
        </div>

        <div *ngIf="selectedClientId && eligibilite" class="p-3 rounded border text-xs" [ngClass]="eligibilite.eligible ? 'bg-gray-50 border-gray-300 text-gray-900' : 'bg-red-50 border-red-200 text-red-900'">
          <div class="font-bold">
            {{ eligibilite.eligible ? 'Client Éligible' : 'Client Non Éligible' }}
          </div>
          <p class="mt-0.5">{{ eligibilite.motif }}</p>
          <p class="text-gray-500 mt-1">Âge : {{ eligibilite.age }} ans | Permis valide : {{ eligibilite.permisValide ? 'Oui' : 'Non' }}</p>
        </div>

        <div class="flex justify-end pt-3 border-t border-gray-200">
          <button (click)="step = 2" [disabled]="!selectedClientId || !eligibilite?.eligible" class="bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white px-4 py-1.5 rounded text-xs font-medium">
            Continuer →
          </button>
        </div>
      </div>

      <!-- Étape 2 : Période -->
      <div *ngIf="step === 2" class="bg-white p-5 rounded-lg border border-gray-200 space-y-4">
        <h2 class="text-sm font-bold text-gray-900">Étape 2 : Période de location</h2>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">Date de début *</label>
            <input type="date" [(ngModel)]="dateDebut" (change)="onDateChange()" class="w-full text-xs border border-gray-300 rounded p-2 bg-white" />
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">Date de fin prévue *</label>
            <input type="date" [(ngModel)]="dateFinPrevue" (change)="onDateChange()" class="w-full text-xs border border-gray-300 rounded p-2 bg-white" />
          </div>
        </div>

        <div class="flex justify-between pt-3 border-t border-gray-200">
          <button (click)="step = 1" class="text-gray-600 text-xs px-3 py-1.5 hover:bg-gray-100 rounded">← Retour</button>
          <button (click)="passerEtape3()" [disabled]="!dateDebut || !dateFinPrevue || dateFinPrevue < dateDebut" class="bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white px-4 py-1.5 rounded text-xs font-medium">
            Choisir un véhicule →
          </button>
        </div>
      </div>

      <!-- Étape 3 : Véhicule -->
      <div *ngIf="step === 3" class="bg-white p-5 rounded-lg border border-gray-200 space-y-4">
        <h2 class="text-sm font-bold text-gray-900">Étape 3 : Choisir un véhicule disponible</h2>

        <div *ngIf="vehiculesDisponibles.length; else noVehicles" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div *ngFor="let v of vehiculesDisponibles" (click)="selectedVehiculeId = v.id" class="p-3 rounded border cursor-pointer transition flex justify-between items-center" [ngClass]="selectedVehiculeId === v.id ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'">
            <div>
              <p class="font-bold text-gray-900 text-xs">{{ v.marque }} {{ v.modele }}</p>
              <p class="text-[11px] text-gray-500 font-mono">{{ v.immatriculation }} • {{ v.carburant }}</p>
              <p class="text-xs text-gray-900 font-semibold mt-0.5">{{ v.prixJournalier }} TND / jour</p>
            </div>
            <div class="text-gray-900 font-bold text-sm">
              <span *ngIf="selectedVehiculeId === v.id">✓</span>
            </div>
          </div>
        </div>

        <ng-template #noVehicles>
          <div class="p-4 text-center text-gray-400 text-xs">
            Aucun véhicule disponible sur cette période.
          </div>
        </ng-template>

        <div class="flex justify-between pt-3 border-t border-gray-200">
          <button (click)="step = 2" class="text-gray-600 text-xs px-3 py-1.5 hover:bg-gray-100 rounded">← Retour</button>
          <button (click)="lancerSimulation()" [disabled]="!selectedVehiculeId" class="bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white px-4 py-1.5 rounded text-xs font-medium">
            Simuler le prix →
          </button>
        </div>
      </div>

      <!-- Étape 4 : Simulation -->
      <div *ngIf="step === 4" class="bg-white p-5 rounded-lg border border-gray-200 space-y-4">
        <h2 class="text-sm font-bold text-gray-900">Étape 4 : Récapitulatif et validation</h2>

        <div *ngIf="simulation" class="bg-gray-50 p-4 rounded border border-gray-200 space-y-2 text-xs">
          <div class="flex justify-between py-1 border-b border-gray-200">
            <span class="text-gray-500">Durée</span>
            <span class="font-bold text-gray-800">{{ simulation.nbJours }} jour(s)</span>
          </div>

          <div class="flex justify-between py-1 border-b border-gray-200">
            <span class="text-gray-500">Tarif journalier</span>
            <span class="font-bold text-gray-800">{{ simulation.prixJournalier | number:'1.2-2' }} TND</span>
          </div>

          <div class="flex justify-between py-1 border-b border-gray-200">
            <span class="text-gray-500">Montant de base</span>
            <span class="font-bold text-gray-800">{{ simulation.montantBase | number:'1.2-2' }} TND</span>
          </div>

          <div class="flex justify-between py-1 border-b border-gray-200">
            <span class="text-gray-500">Remise (Catégorie : {{ simulation.categorieClient }})</span>
            <span class="font-bold text-gray-800">- {{ simulation.remisePourcentage * 100 }} % ({{ simulation.montantRemise | number:'1.2-2' }} TND)</span>
          </div>

          <div class="flex justify-between pt-1.5 text-sm font-bold text-gray-900">
            <span>Total Net :</span>
            <span class="text-base font-extrabold text-gray-900">{{ simulation.montantTotal | number:'1.2-2' }} TND</span>
          </div>
        </div>

        <div class="flex justify-between pt-3 border-t border-gray-200">
          <button (click)="step = 3" class="text-gray-600 text-xs px-3 py-1.5 hover:bg-gray-100 rounded">← Retour</button>
          <button (click)="confirmerReservation()" [disabled]="isSubmitting" class="bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white px-4 py-1.5 rounded text-xs font-medium">
            {{ isSubmitting ? 'Traitement...' : 'Confirmer la réservation' }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class LocationNewComponent implements OnInit {
  step = 1;
  clients: Client[] = [];
  vehiculesDisponibles: Vehicule[] = [];

  selectedClientId: number | null = null;
  eligibilite: EligibiliteResponse | null = null;

  dateDebut = '';
  dateFinPrevue = '';
  selectedVehiculeId: number | null = null;

  simulation: SimulationResponse | null = null;
  errorMessage = '';
  isSubmitting = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clientService: ClientService,
    private vehiculeService: VehiculeService,
    private locationService: LocationService
  ) {}

  ngOnInit(): void {
    const today = new Date();
    const plus3 = new Date();
    plus3.setDate(today.getDate() + 3);

    this.dateDebut = today.toISOString().split('T')[0];
    this.dateFinPrevue = plus3.toISOString().split('T')[0];

    this.clientService.getAll().subscribe({
      next: (list) => {
        this.clients = list;
        const paramClientId = this.route.snapshot.queryParams['clientId'];
        if (paramClientId) {
          this.selectedClientId = Number(paramClientId);
          this.onClientChange();
        }
      }
    });
  }

  onClientChange(): void {
    if (!this.selectedClientId) {
      this.eligibilite = null;
      return;
    }
    this.clientService.checkEligibilite(this.selectedClientId).subscribe({
      next: (e) => (this.eligibilite = e),
      error: (err) => console.error(err)
    });
  }

  onDateChange(): void {
    if (this.dateFinPrevue && this.dateDebut && this.dateFinPrevue < this.dateDebut) {
      this.errorMessage = 'La date de fin ne peut pas précéder la date de début';
    } else {
      this.errorMessage = '';
    }
  }

  passerEtape3(): void {
    this.errorMessage = '';
    this.vehiculeService.getDisponibles(this.dateDebut, this.dateFinPrevue).subscribe({
      next: (list) => {
        this.vehiculesDisponibles = list;
        this.step = 3;
      },
      error: () => (this.errorMessage = 'Impossible de charger les véhicules disponibles')
    });
  }

  lancerSimulation(): void {
    if (!this.selectedClientId || !this.selectedVehiculeId) return;
    this.errorMessage = '';

    this.locationService
      .simuler({
        clientId: this.selectedClientId,
        vehiculeId: this.selectedVehiculeId,
        dateDebut: this.dateDebut,
        dateFinPrevue: this.dateFinPrevue
      })
      .subscribe({
        next: (res) => {
          this.simulation = res;
          this.step = 4;
        },
        error: (err) => (this.errorMessage = err.error?.message || 'Erreur lors de la simulation')
      });
  }

  confirmerReservation(): void {
    if (!this.selectedClientId || !this.selectedVehiculeId) return;
    this.isSubmitting = true;
    this.errorMessage = '';

    this.locationService
      .create({
        clientId: this.selectedClientId,
        vehiculeId: this.selectedVehiculeId,
        dateDebut: this.dateDebut,
        dateFinPrevue: this.dateFinPrevue
      })
      .subscribe({
        next: () => {
          this.router.navigate(['/locations']);
        },
        error: (err) => {
          this.isSubmitting = false;
          this.errorMessage = err.error?.message || 'Erreur lors de la création';
        }
      });
  }
}
