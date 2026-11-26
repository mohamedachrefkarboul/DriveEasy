import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent],
  template: `
    <div class="min-h-screen flex flex-col bg-[#f8fafc] text-gray-800">
      <app-navbar></app-navbar>
      <main class="flex-1 pb-12">
        <router-outlet></router-outlet>
      </main>
      <footer class="bg-white border-t border-gray-200 py-4 text-center text-xs text-gray-500 print:hidden">
        DriveEasy — Projet Web Spring Boot & Angular 22 • LIM3 SESAME
      </footer>
    </div>
  `
})
export class AppComponent {}
