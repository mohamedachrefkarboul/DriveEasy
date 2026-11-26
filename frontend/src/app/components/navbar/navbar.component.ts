import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-14">
          <!-- Nom du Projet / Logo simple -->
          <div class="flex items-center space-x-6">
            <a routerLink="/dashboard" class="text-base font-bold text-gray-900 tracking-tight hover:text-gray-600 transition">
              DriveEasy
            </a>

            <!-- Liens de navigation -->
            <div class="hidden md:flex space-x-1">
              <a routerLink="/dashboard" routerLinkActive="bg-gray-100 text-gray-900 font-semibold" class="px-3 py-1.5 rounded text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition">Tableau de bord</a>
              <a routerLink="/vehicules" routerLinkActive="bg-gray-100 text-gray-900 font-semibold" class="px-3 py-1.5 rounded text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition">Véhicules</a>
              <a routerLink="/clients" routerLinkActive="bg-gray-100 text-gray-900 font-semibold" class="px-3 py-1.5 rounded text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition">Clients</a>
              <a routerLink="/locations" routerLinkActive="bg-gray-100 text-gray-900 font-semibold" class="px-3 py-1.5 rounded text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition">Locations</a>
            </div>
          </div>

          <!-- Actions Droite -->
          <div class="flex items-center space-x-3">
            <a routerLink="/locations/new" class="bg-gray-900 hover:bg-gray-800 text-white px-3 py-1.5 rounded text-xs font-medium transition">
              + Nouvelle Location
            </a>
            <span class="text-xs text-gray-400 border-l border-gray-200 pl-3 hidden sm:inline">SESAME - LIM3</span>
          </div>
        </div>
      </div>
    </nav>
  `
})
export class NavbarComponent {}
