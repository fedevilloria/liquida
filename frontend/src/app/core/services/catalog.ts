import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Bank, Group } from '../models/catalog.model';

@Injectable({
  providedIn: 'root',
})
export class CatalogService {
  private readonly http = inject(HttpClient);

  // URLs de los catálogos del backend durante el desarrollo local.
  private readonly groupsUrl = 'http://localhost:3000/groups';
  private readonly banksUrl = 'http://localhost:3000/banks';

  // Obtiene los grupos disponibles para registrar una liquidación.
  getGroups(): Observable<Group[]> {
    return this.http.get<Group[]>(this.groupsUrl);
  }

  // Obtiene los bancos disponibles y sus porcentajes de comisión.
  getBanks(): Observable<Bank[]> {
    return this.http.get<Bank[]>(this.banksUrl);
  }
}