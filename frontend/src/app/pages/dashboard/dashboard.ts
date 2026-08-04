import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import {
  DashboardFilters,
  DashboardResponse,
} from '../../core/models/dashboard.model';
import { DashboardService } from '../../core/services/dashboard';

import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-dashboard',

  // Permite utilizar el formulario reactivo desde dashboard.html.
  imports: [CurrencyPipe, ReactiveFormsModule],

  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  // Permite crear y administrar el formulario de filtros.
  private readonly formBuilder = inject(FormBuilder);

  // Servicio encargado de comunicarse con el backend.
  private readonly dashboardService = inject(DashboardService);

  // Guarda la información recibida desde la API.
  protected readonly dashboardData = signal<DashboardResponse | null>(null);

  // Indica si se está realizando una solicitud al backend.
  protected readonly isLoading = signal(true);

  // Guarda un mensaje cuando ocurre un error.
  protected readonly errorMessage = signal<string | null>(null);

  // Formulario utilizado para filtrar el Dashboard por fechas.
  protected readonly filtersForm = this.formBuilder.nonNullable.group({
    from: [''],
    to: [''],
  });

  // Se ejecuta automáticamente cuando se abre el Dashboard.
  ngOnInit(): void {
    this.loadDashboard();
  }

  // Aplica las fechas seleccionadas y vuelve a solicitar los indicadores.
  protected applyFilters(): void {
    const { from, to } = this.filtersForm.getRawValue();

    // Evita enviar un rango cuya fecha inicial sea posterior a la final.
    if (from && to && from > to) {
      this.errorMessage.set(
        'La fecha desde no puede ser posterior a la fecha hasta.',
      );

      return;
    }

    this.loadDashboard({
      from: from || undefined,
      to: to || undefined,
    });
  }

  // Limpia las fechas y vuelve a mostrar todos los datos.
  protected clearFilters(): void {
    this.filtersForm.reset({
      from: '',
      to: '',
    });

    this.loadDashboard();
  }

  // Permite volver a intentar la solicitud si ocurrió un error.
  protected retry(): void {
    this.applyFilters();
  }

  // Solicita al backend los indicadores generales del Dashboard.
  private loadDashboard(filters: DashboardFilters = {}): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.dashboardService
      .getDashboard(filters)
      .pipe(
        // Se ejecuta tanto si la solicitud finaliza correctamente como si falla.
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe({
        next: (response) => {
          this.dashboardData.set(response);
        },
        error: (error) => {
          console.error('Error al cargar el Dashboard:', error);

          this.errorMessage.set(
            'No se pudo obtener la información del Dashboard.',
          );
        },
      });
  }
}