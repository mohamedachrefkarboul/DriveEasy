import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { VehiculeListComponent } from './components/vehicules/vehicule-list/vehicule-list.component';
import { VehiculeFormComponent } from './components/vehicules/vehicule-form/vehicule-form.component';
import { ClientListComponent } from './components/clients/client-list/client-list.component';
import { ClientDetailComponent } from './components/clients/client-detail/client-detail.component';
import { LocationListComponent } from './components/locations/location-list/location-list.component';
import { LocationNewComponent } from './components/locations/location-new/location-new.component';
import { LocationRetourComponent } from './components/locations/location-retour/location-retour.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'vehicules', component: VehiculeListComponent },
  { path: 'vehicules/new', component: VehiculeFormComponent },
  { path: 'vehicules/:id/edit', component: VehiculeFormComponent },
  { path: 'clients', component: ClientListComponent },
  { path: 'clients/:id', component: ClientDetailComponent },
  { path: 'locations', component: LocationListComponent },
  { path: 'locations/new', component: LocationNewComponent },
  { path: 'locations/:id/retour', component: LocationRetourComponent },
  { path: '**', redirectTo: 'dashboard' }
];
