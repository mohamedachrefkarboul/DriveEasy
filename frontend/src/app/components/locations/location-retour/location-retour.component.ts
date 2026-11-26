import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LocationService } from '../../../services/location.service';
import { LocationDetail } from '../../../models/location.model';

@Component({
  selector: 'app-location-retour',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="max-w-2xl mx-auto px-4 py-6 space-y-5">
      <div class="print:hidden">
        <a routerLink="/locations" class="text-xs text-gray-500 hover:text-gray-900 flex items-center space-x-1 mb-2">
          <span>←</span>
          <span>Retour aux locations</span>
        </a>
        <h1 class="text-xl font-bold text-gray-900">
          {{ isTerminee ? 'Reçu de location #' + detail?.location?.id : 'Retour de véhicule #' + detail?.location?.id }}
        </h1>
        <p class="text-xs text-gray-500">Clôture du dossier et calcul des pénalités</p>
      </div>

      <!-- Erreur -->
      <div *ngIf="errorMessage" class="p-2.5 bg-red-50 text-red-800 border border-red-200 rounded text-xs print:hidden">
        {{ errorMessage }}
      </div>

      <!-- Formulaire de retour si EN_COURS -->
      <div *ngIf="!isTerminee" class="bg-white p-5 rounded-lg border border-gray-200 space-y-4 print:hidden">
        <div class="bg-gray-50 p-3 rounded border border-gray-200 grid grid-cols-2 gap-3 text-xs">
          <div>
            <span class="text-gray-400 block text-[11px]">Véhicule</span>
            <span class="font-bold text-gray-800">{{ detail?.vehicule?.marque }} {{ detail?.vehicule?.modele }}</span>
            <span class="font-mono text-gray-500 block">{{ detail?.vehicule?.immatriculation }}</span>
          </div>
          <div>
            <span class="text-gray-400 block text-[11px]">Client</span>
            <span class="font-bold text-gray-800">{{ detail?.client?.prenom }} {{ detail?.client?.nom }}</span>
            <span class="text-gray-500 block">Catégorie : {{ detail?.client?.categorieClient }}</span>
          </div>
          <div>
            <span class="text-gray-400 block text-[11px]">Kilométrage de départ</span>
            <span class="font-bold text-gray-800">{{ detail?.location?.kmDepart || detail?.vehicule?.kilometrage || 0 }} km</span>
          </div>
          <div>
            <span class="text-gray-400 block text-[11px]">Date de fin prévue</span>
            <span class="font-bold text-gray-800">{{ detail?.location?.dateFinPrevue }}</span>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">Date effective de retour *</label>
            <input type="date" [(ngModel)]="dateRetourEffectif" (change)="calculerPenaliteEnDirect()" class="w-full text-xs border border-gray-300 rounded p-2 bg-white" />
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">Kilométrage au retour (km) *</label>
            <input type="number" [(ngModel)]="kmRetour" placeholder="Ex: 21500" class="w-full text-xs border border-gray-300 rounded p-2 bg-white" />
          </div>
        </div>

        <!-- Simulation retard -->
        <div *ngIf="joursRetard > 0" class="p-2.5 bg-gray-50 border border-gray-300 text-gray-800 rounded text-xs space-y-1">
          <p class="font-bold">Retard constaté : {{ joursRetard }} jour(s)</p>
          <p>Pénalité calculée (1.5 × tarif journalier) : <span class="font-bold text-gray-900">{{ penaliteCalculee | number:'1.2-2' }} TND</span></p>
        </div>

        <div class="flex justify-end pt-3 border-t border-gray-200">
          <button (click)="validerRetour()" [disabled]="!kmRetour || isSubmitting" class="bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white px-4 py-1.5 rounded text-xs font-medium">
            {{ isSubmitting ? 'Traitement...' : 'Clôturer le retour' }}
          </button>
        </div>
      </div>

      <!-- REÇU FINAL IMPRIMABLE -->
      <div *ngIf="isTerminee && detail" class="bg-white p-6 rounded-lg border border-gray-300 space-y-5 print:border-none print:shadow-none">
        <!-- En-tête -->
        <div class="flex justify-between items-start border-b border-gray-200 pb-4">
          <div>
            <h2 class="text-lg font-bold text-gray-900">DriveEasy</h2>
            <p class="text-xs text-gray-500">Location de Véhicules</p>
            <p class="text-[11px] text-gray-400">SESAME - LIM3</p>
          </div>
          <div class="text-right">
            <span class="inline-block bg-gray-100 border border-gray-300 text-gray-800 font-medium text-[11px] px-2 py-0.5 rounded">
              Dossier Clôturé
            </span>
            <p class="text-xs text-gray-500 mt-1 font-mono">Dossier #{{ detail.location.id }}</p>
            <p class="text-[11px] text-gray-400">Date : {{ dateAujourdhui }}</p>
          </div>
        </div>

        <!-- Informations -->
        <div class="grid grid-cols-2 gap-4 text-xs text-gray-700">
          <div>
            <p class="font-bold text-gray-900 mb-1">Client</p>
            <p>{{ detail.client?.prenom }} {{ detail.client?.nom }}</p>
            <p>CIN : {{ detail.client?.cin }}</p>
            <p>Permis : {{ detail.client?.numeroPermis }}</p>
            <p>Catégorie : {{ detail.client?.categorieClient }}</p>
          </div>

          <div>
            <p class="font-bold text-gray-900 mb-1">Véhicule</p>
            <p>{{ detail.vehicule?.marque }} {{ detail.vehicule?.modele }}</p>
            <p>Immatriculation : {{ detail.vehicule?.immatriculation }}</p>
            <p>Km départ : {{ detail.location.kmDepart || 'N/A' }} km</p>
            <p>Km retour : {{ detail.location.kmRetour || 'N/A' }} km</p>
          </div>
        </div>

        <!-- Frais -->
        <div class="border border-gray-200 rounded overflow-hidden">
          <table class="w-full text-xs text-left text-gray-700">
            <thead class="bg-gray-50 font-semibold border-b border-gray-200">
              <tr>
                <th class="py-2 px-3">Désignation</th>
                <th class="py-2 px-3 text-center">Période</th>
                <th class="py-2 px-3 text-right">Montant</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr>
                <td class="py-2 px-3 font-medium">Forfait location</td>
                <td class="py-2 px-3 text-center">{{ detail.location.dateDebut }} au {{ detail.location.dateFinPrevue }}</td>
                <td class="py-2 px-3 text-right">{{ (detail.location.montantTotal - (detail.location.penalite || 0)) | number:'1.2-2' }} TND</td>
              </tr>
              <tr *ngIf="detail.location.penalite && detail.location.penalite > 0" class="bg-gray-50">
                <td class="py-2 px-3 font-medium">Pénalités de retard</td>
                <td class="py-2 px-3 text-center">Retour le {{ detail.location.dateRetourEffectif }}</td>
                <td class="py-2 px-3 text-right font-bold">+ {{ detail.location.penalite | number:'1.2-2' }} TND</td>
              </tr>
            </tbody>
            <tfoot class="bg-gray-50 font-bold text-gray-900 border-t border-gray-200">
              <tr>
                <td colspan="2" class="py-2.5 px-3 text-right">Total Net Réglé :</td>
                <td class="py-2.5 px-3 text-right text-sm">{{ detail.location.montantTotal | number:'1.2-2' }} TND</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- Signature -->
        <div class="grid grid-cols-2 gap-4 pt-4 text-xs text-gray-500">
          <div>
            <p class="mb-6 font-medium text-gray-700">Signature Client :</p>
            <div class="border-b border-gray-300 w-36"></div>
          </div>
          <div class="text-right">
            <p class="mb-6 font-medium text-gray-700">Cachet Agence :</p>
            <div class="inline-block border-b border-gray-300 w-36"></div>
          </div>
        </div>

        <!-- Bouton impression -->
        <div class="pt-3 border-t border-gray-200 flex justify-between print:hidden">
          <a routerLink="/locations" class="text-xs text-gray-500 hover:text-gray-800 py-1.5">← Retour</a>
          <button (click)="imprimer()" class="bg-gray-900 hover:bg-gray-800 text-white px-3.5 py-1.5 rounded text-xs font-medium">
            Imprimer le reçu
          </button>
        </div>
      </div>
    </div>
  `
})
export class LocationRetourComponent implements OnInit {
  locationId!: number;
  detail: LocationDetail | null = null;
  isTerminee = false;

  dateRetourEffectif = '';
  kmRetour: number | null = null;
  joursRetard = 0;
  penaliteCalculee = 0;

  isSubmitting = false;
  errorMessage = '';
  dateAujourdhui = new Date().toLocaleDateString('fr-FR');

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private locationService: LocationService
  ) {}

  ngOnInit(): void {
    this.locationId = Number(this.route.snapshot.paramMap.get('id'));
    this.dateRetourEffectif = new Date().toISOString().split('T')[0];
    this.chargerDetail();
  }

  chargerDetail(): void {
    this.locationService.getById(this.locationId).subscribe({
      next: (data) => {
        this.detail = data;
        this.isTerminee = data.location.statut === 'TERMINEE';
        if (!this.isTerminee && data.location.kmDepart) {
          this.kmRetour = data.location.kmDepart + 150;
        }
        this.calculerPenaliteEnDirect();
      },
      error: () => (this.errorMessage = 'Impossible de charger le dossier')
    });
  }

  calculerPenaliteEnDirect(): void {
    if (!this.detail || !this.dateRetourEffectif) return;
    const finPrevue = new Date(this.detail.location.dateFinPrevue);
    const retour = new Date(this.dateRetourEffectif);

    if (retour > finPrevue) {
      const diffTime = Math.abs(retour.getTime() - finPrevue.getTime());
      this.joursRetard = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const tarifJour = this.detail.location.prixJournalierApplique || 0;
      this.penaliteCalculee = this.joursRetard * (1.5 * tarifJour);
    } else {
      this.joursRetard = 0;
      this.penaliteCalculee = 0;
    }
  }

  validerRetour(): void {
    if (!this.kmRetour) return;
    this.isSubmitting = true;
    this.errorMessage = '';

    this.locationService
      .retourner(this.locationId, this.kmRetour, this.dateRetourEffectif)
      .subscribe({
        next: () => {
          this.isSubmitting = false;
          this.chargerDetail();
        },
        error: (err) => {
          this.isSubmitting = false;
          this.errorMessage = err.error?.message || 'Erreur lors de la validation';
        }
      });
  }

  imprimer(): void {
    window.print();
  }
}
