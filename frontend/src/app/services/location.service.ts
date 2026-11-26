import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Location,
  LocationDetail,
  SimulationRequest,
  SimulationResponse,
  Statistiques,
  StatutLocation
} from '../models/location.model';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private readonly baseUrl = 'http://localhost:8080/api/locations';

  constructor(private http: HttpClient) {}

  getAll(statut?: StatutLocation, clientId?: number, vehiculeId?: number, page = 0, size = 10): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (statut) params = params.set('statut', statut);
    if (clientId) params = params.set('clientId', clientId.toString());
    if (vehiculeId) params = params.set('vehiculeId', vehiculeId.toString());

    return this.http.get<any>(this.baseUrl, { params });
  }

  getById(id: number): Observable<LocationDetail> {
    return this.http.get<LocationDetail>(`${this.baseUrl}/${id}`);
  }

  create(location: { clientId: number; vehiculeId: number; dateDebut: string; dateFinPrevue: string }): Observable<Location> {
    return this.http.post<Location>(this.baseUrl, location);
  }

  simuler(request: SimulationRequest): Observable<SimulationResponse> {
    return this.http.post<SimulationResponse>(`${this.baseUrl}/simulation`, request);
  }

  demarrer(id: number, kmDepart?: number): Observable<Location> {
    return this.http.patch<Location>(`${this.baseUrl}/${id}/depart`, { kmDepart });
  }

  retourner(id: number, kmRetour: number, dateRetourEffectif?: string): Observable<Location> {
    return this.http.patch<Location>(`${this.baseUrl}/${id}/retour`, { kmRetour, dateRetourEffectif });
  }

  annuler(id: number): Observable<Location> {
    return this.http.patch<Location>(`${this.baseUrl}/${id}/annulation`, {});
  }

  getStatistiques(): Observable<Statistiques> {
    return this.http.get<Statistiques>(`${this.baseUrl}/statistiques`);
  }
}
