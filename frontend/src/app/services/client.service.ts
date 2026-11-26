import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Client, EligibiliteResponse, CategorieClient } from '../models/client.model';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private readonly baseUrl = 'http://localhost:8080/api/clients';

  constructor(private http: HttpClient) {}

  getAll(query?: string): Observable<Client[]> {
    let params = new HttpParams();
    if (query && query.trim()) {
      params = params.set('query', query.trim());
    }
    return this.http.get<Client[]>(this.baseUrl, { params });
  }

  getById(id: number): Observable<Client> {
    return this.http.get<Client>(`${this.baseUrl}/${id}`);
  }

  create(client: Client): Observable<Client> {
    return this.http.post<Client>(this.baseUrl, client);
  }

  update(id: number, client: Client): Observable<Client> {
    return this.http.put<Client>(`${this.baseUrl}/${id}`, client);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  checkEligibilite(id: number): Observable<EligibiliteResponse> {
    return this.http.get<EligibiliteResponse>(`${this.baseUrl}/${id}/eligibilite`);
  }

  updateCategorie(id: number, categorieClient: CategorieClient): Observable<Client> {
    return this.http.patch<Client>(`${this.baseUrl}/${id}/categorie`, { categorieClient });
  }
}
