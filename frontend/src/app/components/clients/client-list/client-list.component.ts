import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClientService } from '../../../services/client.service';
import { Client } from '../../../models/client.model';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      <!-- En-tête -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-4">
        <div>
          <h1 class="text-xl font-bold text-gray-900">Clients</h1>
          <p class="text-xs text-gray-500 mt-0.5">Gestion de la clientèle et validité des permis</p>
        </div>
        <div class="mt-3 sm:mt-0">
          <button (click)="openModal()" class="bg-gray-900 hover:bg-gray-800 text-white px-3.5 py-1.5 rounded text-xs font-medium transition">
            + Nouveau Client
          </button>
        </div>
      </div>

      <!-- Recherche -->
      <div class="bg-white p-3 rounded-lg border border-gray-200 flex items-center space-x-2">
        <span class="text-gray-400 text-xs">Recherche :</span>
        <input
          type="text"
          [(ngModel)]="searchQuery"
          (input)="rechercher()"
          placeholder="Rechercher par Nom, Prénom, CIN ou Email..."
          class="w-full text-xs outline-none bg-transparent text-gray-700"
        />
        <button *ngIf="searchQuery" (click)="searchQuery = ''; rechercher()" class="text-xs text-gray-400 hover:text-gray-600">
          Effacer
        </button>
      </div>

      <!-- Message -->
      <div *ngIf="message" [ngClass]="messageType === 'success' ? 'bg-gray-100 text-gray-900 border-gray-300' : 'bg-red-50 text-red-800 border-red-200'" class="p-2.5 rounded border text-xs">
        {{ message }}
      </div>

      <!-- Tableau -->
      <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-gray-600">
            <thead class="bg-gray-50 text-gray-700 uppercase font-semibold border-b border-gray-200">
              <tr>
                <th class="py-2.5 px-3">Client</th>
                <th class="py-2.5 px-3">CIN</th>
                <th class="py-2.5 px-3">Permis</th>
                <th class="py-2.5 px-3">Catégorie</th>
                <th class="py-2.5 px-3">Contact</th>
                <th class="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr *ngFor="let c of clients" class="hover:bg-gray-50">
                <td class="py-2.5 px-3">
                  <div class="font-semibold text-gray-900">{{ c.prenom }} {{ c.nom }}</div>
                  <div class="text-[11px] text-gray-400">Né(e) le {{ c.dateNaissance }}</div>
                </td>
                <td class="py-2.5 px-3">
                  <span class="font-mono text-[11px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-700 border border-gray-200">{{ c.cin }}</span>
                </td>
                <td class="py-2.5 px-3">
                  <div class="font-mono text-[11px] text-gray-800">{{ c.numeroPermis }}</div>
                  <div class="mt-0.5">
                    <span *ngIf="isPermisExpire(c.dateExpirationPermis)" class="text-[11px] text-red-700 font-semibold">
                      Permis expiré ({{ c.dateExpirationPermis }})
                    </span>
                    <span *ngIf="!isPermisExpire(c.dateExpirationPermis)" class="text-[11px] text-gray-500">
                      Expire le {{ c.dateExpirationPermis }}
                    </span>
                  </div>
                </td>
                <td class="py-2.5 px-3">
                  <span class="badge" [ngClass]="{
                    'badge-standard': c.categorieClient === 'STANDARD',
                    'badge-fidele': c.categorieClient === 'FIDELE',
                    'badge-vip': c.categorieClient === 'VIP'
                  }">
                    {{ c.categorieClient }}
                  </span>
                </td>
                <td class="py-2.5 px-3 text-[11px]">
                  <div>{{ c.email }}</div>
                  <div class="text-gray-400">{{ c.telephone }}</div>
                </td>
                <td class="py-2.5 px-3 text-right">
                  <a [routerLink]="['/clients', c.id]" class="text-xs text-gray-700 hover:text-black font-medium underline">
                    Détail
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modal Nouveau Client -->
      <div *ngIf="showModal" class="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-lg shadow-lg max-w-md w-full p-5 space-y-4 border border-gray-300">
          <div class="flex justify-between items-center border-b border-gray-200 pb-2.5">
            <h3 class="text-sm font-bold text-gray-900">Ajouter un client</h3>
            <button (click)="closeModal()" class="text-gray-400 hover:text-gray-600 text-xs font-mono">✕</button>
          </div>

          <div *ngIf="modalError" class="p-2 bg-red-50 text-red-700 text-xs rounded border border-red-200">
            {{ modalError }}
          </div>

          <div class="grid grid-cols-2 gap-2.5 text-xs">
            <div>
              <label class="block font-medium text-gray-700 mb-0.5">CIN *</label>
              <input type="text" [(ngModel)]="nouveauClient.cin" class="w-full border border-gray-300 p-1.5 rounded font-mono" />
            </div>
            <div>
              <label class="block font-medium text-gray-700 mb-0.5">Téléphone *</label>
              <input type="text" [(ngModel)]="nouveauClient.telephone" class="w-full border border-gray-300 p-1.5 rounded" />
            </div>
            <div>
              <label class="block font-medium text-gray-700 mb-0.5">Nom *</label>
              <input type="text" [(ngModel)]="nouveauClient.nom" class="w-full border border-gray-300 p-1.5 rounded" />
            </div>
            <div>
              <label class="block font-medium text-gray-700 mb-0.5">Prénom *</label>
              <input type="text" [(ngModel)]="nouveauClient.prenom" class="w-full border border-gray-300 p-1.5 rounded" />
            </div>
            <div>
              <label class="block font-medium text-gray-700 mb-0.5">Date de naissance *</label>
              <input type="date" [(ngModel)]="nouveauClient.dateNaissance" class="w-full border border-gray-300 p-1.5 rounded" />
            </div>
            <div>
              <label class="block font-medium text-gray-700 mb-0.5">Email *</label>
              <input type="email" [(ngModel)]="nouveauClient.email" class="w-full border border-gray-300 p-1.5 rounded" />
            </div>
            <div>
              <label class="block font-medium text-gray-700 mb-0.5">N° Permis *</label>
              <input type="text" [(ngModel)]="nouveauClient.numeroPermis" class="w-full border border-gray-300 p-1.5 rounded font-mono" />
            </div>
            <div>
              <label class="block font-medium text-gray-700 mb-0.5">Expiration Permis *</label>
              <input type="date" [(ngModel)]="nouveauClient.dateExpirationPermis" class="w-full border border-gray-300 p-1.5 rounded" />
            </div>
            <div class="col-span-2">
              <label class="block font-medium text-gray-700 mb-0.5">Adresse</label>
              <input type="text" [(ngModel)]="nouveauClient.adresse" class="w-full border border-gray-300 p-1.5 rounded" />
            </div>
          </div>

          <div class="flex justify-end space-x-2 pt-2.5 border-t border-gray-200">
            <button (click)="closeModal()" class="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded">Annuler</button>
            <button (click)="sauvegarderClient()" class="px-3.5 py-1.5 text-xs bg-gray-900 text-white font-medium rounded hover:bg-gray-800">
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ClientListComponent implements OnInit {
  clients: Client[] = [];
  searchQuery = '';
  message = '';
  messageType: 'success' | 'error' = 'success';

  showModal = false;
  modalError = '';
  nouveauClient: Partial<Client> = {
    categorieClient: 'STANDARD'
  };

  constructor(private clientService: ClientService) {}

  ngOnInit(): void {
    this.rechercher();
  }

  rechercher(): void {
    this.clientService.getAll(this.searchQuery).subscribe({
      next: (data) => (this.clients = data),
      error: (err) => console.error(err)
    });
  }

  isPermisExpire(dateExp: string): boolean {
    if (!dateExp) return true;
    return new Date(dateExp) < new Date();
  }

  openModal(): void {
    this.nouveauClient = {
      dateNaissance: '2000-01-01',
      dateExpirationPermis: '2028-12-31',
      categorieClient: 'STANDARD'
    };
    this.modalError = '';
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  sauvegarderClient(): void {
    if (!this.nouveauClient.cin || !this.nouveauClient.nom || !this.nouveauClient.email || !this.nouveauClient.numeroPermis) {
      this.modalError = 'Veuillez remplir les champs obligatoires';
      return;
    }

    this.clientService.create(this.nouveauClient as Client).subscribe({
      next: () => {
        this.closeModal();
        this.message = 'Client ajouté.';
        this.messageType = 'success';
        this.rechercher();
        setTimeout(() => (this.message = ''), 4000);
      },
      error: (err) => {
        this.modalError = err.error?.message || 'Erreur lors de la création';
      }
    });
  }
}
