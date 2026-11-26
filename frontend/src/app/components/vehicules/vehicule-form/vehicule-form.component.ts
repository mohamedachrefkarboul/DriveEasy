import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { VehiculeService } from '../../../services/vehicule.service';
import { Vehicule } from '../../../models/vehicule.model';

@Component({
  selector: 'app-vehicule-form',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="max-w-2xl mx-auto px-4 py-6">
      <div class="mb-5">
        <a routerLink="/vehicules" class="text-xs text-gray-500 hover:text-gray-900 flex items-center space-x-1 mb-2">
          <span>←</span>
          <span>Retour au catalogue</span>
        </a>
        <h1 class="text-xl font-bold text-gray-900">{{ isEditMode ? 'Modifier le véhicule' : 'Nouveau véhicule' }}</h1>
        <p class="text-xs text-gray-500">Formulaire d'enregistrement du parc automobile</p>
      </div>

      <div *ngIf="errorMessage" class="mb-4 p-3 bg-red-50 text-red-800 border border-red-200 rounded text-xs">
        {{ errorMessage }}
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="bg-white p-5 rounded-lg border border-gray-200 space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">Immatriculation *</label>
            <input type="text" formControlName="immatriculation" placeholder="Ex: 210-TN-4521" class="w-full text-xs border border-gray-300 rounded p-2 font-mono bg-white" />
            <p *ngIf="form.get('immatriculation')?.touched && form.get('immatriculation')?.invalid" class="text-[11px] text-red-600 mt-0.5">Obligatoire</p>
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">Prix Journalier (TND) *</label>
            <input type="number" step="0.01" formControlName="prixJournalier" class="w-full text-xs border border-gray-300 rounded p-2 bg-white" />
            <p *ngIf="form.get('prixJournalier')?.touched && form.get('prixJournalier')?.invalid" class="text-[11px] text-red-600 mt-0.5">Doit être supérieur à 0</p>
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">Marque *</label>
            <input type="text" formControlName="marque" placeholder="Ex: Renault" class="w-full text-xs border border-gray-300 rounded p-2 bg-white" />
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">Modèle *</label>
            <input type="text" formControlName="modele" placeholder="Ex: Clio 5" class="w-full text-xs border border-gray-300 rounded p-2 bg-white" />
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">Année *</label>
            <input type="number" formControlName="annee" class="w-full text-xs border border-gray-300 rounded p-2 bg-white" />
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">Couleur *</label>
            <input type="text" formControlName="couleur" placeholder="Ex: Blanc" class="w-full text-xs border border-gray-300 rounded p-2 bg-white" />
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">Carburant *</label>
            <select formControlName="carburant" class="w-full text-xs border border-gray-300 rounded p-2 bg-white">
              <option value="ESSENCE">Essence</option>
              <option value="DIESEL">Diesel</option>
              <option value="HYBRIDE">Hybride</option>
              <option value="ELECTRIQUE">Électrique</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">Boîte de vitesse *</label>
            <select formControlName="boite" class="w-full text-xs border border-gray-300 rounded p-2 bg-white">
              <option value="MANUELLE">Manuelle</option>
              <option value="AUTOMATIQUE">Automatique</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">Nombre de places *</label>
            <input type="number" formControlName="nbPlaces" class="w-full text-xs border border-gray-300 rounded p-2 bg-white" />
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">Kilométrage *</label>
            <input type="number" formControlName="kilometrage" class="w-full text-xs border border-gray-300 rounded p-2 bg-white" />
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">Statut *</label>
            <select formControlName="statut" class="w-full text-xs border border-gray-300 rounded p-2 bg-white">
              <option value="DISPONIBLE">Disponible</option>
              <option value="LOUE">Loué</option>
              <option value="MAINTENANCE">Maintenance</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">Image URL (optionnel)</label>
            <input type="text" formControlName="imageUrl" class="w-full text-xs border border-gray-300 rounded p-2 bg-white" />
          </div>
        </div>

        <div class="pt-3 border-t border-gray-200 flex justify-end space-x-2">
          <a routerLink="/vehicules" class="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900">Annuler</a>
          <button type="submit" [disabled]="form.invalid || isSaving" class="bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white px-4 py-1.5 rounded text-xs font-medium">
            {{ isSaving ? 'Enregistrement...' : 'Enregistrer' }}
          </button>
        </div>
      </form>
    </div>
  `
})
export class VehiculeFormComponent implements OnInit {
  form!: FormGroup;
  isEditMode = false;
  vehiculeId?: number;
  isSaving = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private vehiculeService: VehiculeService
  ) {}

  ngOnInit(): void {
    const currentYear = new Date().getFullYear();

    this.form = this.fb.group({
      immatriculation: ['', Validators.required],
      marque: ['', Validators.required],
      modele: ['', Validators.required],
      annee: [currentYear, [Validators.required, Validators.min(1990), Validators.max(currentYear)]],
      couleur: ['', Validators.required],
      carburant: ['ESSENCE', Validators.required],
      boite: ['MANUELLE', Validators.required],
      nbPlaces: [5, [Validators.required, Validators.min(1)]],
      kilometrage: [0, [Validators.required, Validators.min(0)]],
      prixJournalier: [80.0, [Validators.required, Validators.min(0.01)]],
      statut: ['DISPONIBLE', Validators.required],
      imageUrl: ['']
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.vehiculeId = Number(idParam);
      this.vehiculeService.getById(this.vehiculeId).subscribe({
        next: (data) => this.form.patchValue(data),
        error: () => (this.errorMessage = 'Impossible de charger le véhicule')
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.isSaving = true;
    this.errorMessage = '';
    const payload: Vehicule = this.form.value;

    if (this.isEditMode && this.vehiculeId) {
      this.vehiculeService.update(this.vehiculeId, payload).subscribe({
        next: () => this.router.navigate(['/vehicules']),
        error: (err) => {
          this.isSaving = false;
          this.errorMessage = err.error?.message || 'Erreur lors de la mise à jour';
        }
      });
    } else {
      this.vehiculeService.create(payload).subscribe({
        next: () => this.router.navigate(['/vehicules']),
        error: (err) => {
          this.isSaving = false;
          this.errorMessage = err.error?.message || 'Erreur lors de la création';
        }
      });
    }
  }
}
