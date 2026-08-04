import { DatePipe, DecimalPipe } from '@angular/common';
import {
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { Bank, Group } from '../../core/models/catalog.model';
import {
  CommissionCalculation,
  CommissionCalculationPagination,
} from '../../core/models/commission-calculation.model';
import { CatalogService } from '../../core/services/catalog';
import { CommissionCalculationsService } from '../../core/services/commission-calculations';

@Component({
  selector: 'app-calculation-history',
  imports: [DatePipe, DecimalPipe, FormsModule],
  templateUrl: './calculation-history.html',
  styleUrl: './calculation-history.scss',
})
export class CalculationHistory {
  private readonly calculationsService = inject(
    CommissionCalculationsService,
  );
  private readonly catalogService = inject(CatalogService);
  private readonly destroyRef = inject(DestroyRef);

  // Liquidaciones correspondientes a la página actual.
  protected readonly calculations = signal<CommissionCalculation[]>([]);

  // Información necesaria para navegar entre las páginas.
  protected readonly pagination =
    signal<CommissionCalculationPagination | null>(null);

  // Catálogos utilizados por los filtros.
  protected readonly groups = signal<Group[]>([]);
  protected readonly banks = signal<Bank[]>([]);

  // Estados relacionados con la consulta del historial.
  protected readonly isLoading = signal(true);
  protected readonly loadError = signal<string | null>(null);

  // Estado de carga de los catálogos.
  protected readonly areCatalogsLoading = signal(true);
  protected readonly catalogsError = signal<string | null>(null);

  // Valores seleccionados en el formulario de filtros.
  protected selectedGroupId: number | null = null;
  protected selectedBankId: number | null = null;
  protected fromDate = '';
  protected toDate = '';

  constructor() {
    this.loadCatalogs();
    this.loadCalculations();
  }

  /**
   * Obtiene los grupos y bancos disponibles para los filtros.
   */
  private loadCatalogs(): void {
    this.areCatalogsLoading.set(true);
    this.catalogsError.set(null);

    forkJoin({
      groups: this.catalogService.getGroups(),
      banks: this.catalogService.getBanks(),
    })
      .pipe(
        finalize(() => this.areCatalogsLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: ({ groups, banks }) => {
          // Solo se muestran opciones activas en los filtros.
          this.groups.set(groups.filter((group) => group.active));
          this.banks.set(banks.filter((bank) => bank.active));
        },
        error: () => {
          this.groups.set([]);
          this.banks.set([]);
          this.catalogsError.set(
            'No se pudieron cargar los grupos y bancos disponibles.',
          );
        },
      });
  }

  /**
   * Obtiene una página del historial aplicando los filtros seleccionados.
   */
  protected loadCalculations(page = 1): void {
    this.isLoading.set(true);
    this.loadError.set(null);

    this.calculationsService
      .getCalculations({
        groupId: this.selectedGroupId ?? undefined,
        bankId: this.selectedBankId ?? undefined,
        from: this.fromDate || undefined,
        to: this.toDate || undefined,
        page,
        limit: 10,
      })
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          this.calculations.set(response.data);
          this.pagination.set(response.pagination);
        },
        error: () => {
          this.calculations.set([]);
          this.pagination.set(null);
          this.loadError.set(
            'No se pudo cargar el historial de liquidaciones. Verificá que el backend esté funcionando.',
          );
        },
      });
  }

  /**
   * Aplica los filtros y vuelve a consultar desde la primera página.
   */
  protected applyFilters(): void {
    this.loadCalculations(1);
  }

  /**
   * Restablece los filtros y vuelve a cargar todo el historial.
   */
  protected clearFilters(): void {
    this.selectedGroupId = null;
    this.selectedBankId = null;
    this.fromDate = '';
    this.toDate = '';

    this.loadCalculations(1);
  }

  /**
   * Indica si hay al menos un filtro seleccionado.
   */
  protected hasActiveFilters(): boolean {
    return (
      this.selectedGroupId !== null ||
      this.selectedBankId !== null ||
      this.fromDate !== '' ||
      this.toDate !== ''
    );
  }

  /**
   * Solicita la página anterior del historial.
   */
  protected goToPreviousPage(): void {
    const currentPagination = this.pagination();

    if (!currentPagination?.hasPreviousPage) {
      return;
    }

    this.loadCalculations(currentPagination.page - 1);
  }

  /**
   * Solicita la página siguiente del historial.
   */
  protected goToNextPage(): void {
    const currentPagination = this.pagination();

    if (!currentPagination?.hasNextPage) {
      return;
    }

    this.loadCalculations(currentPagination.page + 1);
  }
}