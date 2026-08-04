import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  DashboardFilters,
  DashboardResponse,
} from '../models/dashboard.model';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly http = inject(HttpClient);

  // URL base del backend durante el desarrollo local.
  private readonly apiUrl =
    'http://localhost:3000/commission-calculations/dashboard';

  // Obtiene los indicadores generales del Dashboard.
  getDashboard(filters: DashboardFilters = {}): Observable<DashboardResponse> {
    let params = new HttpParams();

    // Los filtros solamente se envían cuando tienen un valor.
    if (filters.from) {
      params = params.set('from', filters.from);
    }

    if (filters.to) {
      params = params.set('to', filters.to);
    }

    return this.http.get<DashboardResponse>(this.apiUrl, { params });
  }
}