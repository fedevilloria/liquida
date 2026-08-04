import { inject, Injectable } from '@angular/core';
import {
  HttpClient,
  HttpParams,
} from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  CommissionCalculation,
  CommissionCalculationFilters,
  CommissionCalculationsResponse,
  RegisterCommissionCalculation,
} from '../models/commission-calculation.model';

@Injectable({
  providedIn: 'root',
})
export class CommissionCalculationsService {
  private readonly http = inject(HttpClient);

  // URL base del recurso de liquidaciones durante el desarrollo local.
  private readonly apiUrl =
    'http://localhost:3000/commission-calculations';

  // Envía los datos ingresados por el usuario para registrar una liquidación.
  registerCalculation(
    calculation: RegisterCommissionCalculation,
  ): Observable<CommissionCalculation> {
    return this.http.post<CommissionCalculation>(
      this.apiUrl,
      calculation,
    );
  }

  /**
   * Obtiene el historial paginado de liquidaciones.
   *
   * Los filtros se incorporan a la URL solamente cuando
   * fueron seleccionados por el usuario.
   */
  getCalculations(
    filters: CommissionCalculationFilters = {},
  ): Observable<CommissionCalculationsResponse> {
    let params = new HttpParams();

    if (filters.groupId !== undefined) {
      params = params.set('groupId', filters.groupId.toString());
    }

    if (filters.bankId !== undefined) {
      params = params.set('bankId', filters.bankId.toString());
    }

    if (filters.from) {
      params = params.set('from', filters.from);
    }

    if (filters.to) {
      params = params.set('to', filters.to);
    }

    if (filters.page !== undefined) {
      params = params.set('page', filters.page.toString());
    }

    if (filters.limit !== undefined) {
      params = params.set('limit', filters.limit.toString());
    }

    return this.http.get<CommissionCalculationsResponse>(
      this.apiUrl,
      { params },
    );
  }
}