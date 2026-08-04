import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  CommissionCalculation,
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
}