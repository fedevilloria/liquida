import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { Bank, Group } from '../../core/models/catalog.model';
import {
  CommissionCalculation,
  RegisterCommissionCalculation,
} from '../../core/models/commission-calculation.model';
import { CatalogService } from '../../core/services/catalog';
import { CommissionCalculationsService } from '../../core/services/commission-calculations';

@Component({
  selector: 'app-new-calculation',
  imports: [ReactiveFormsModule],
  templateUrl: './new-calculation.html',
  styleUrl: './new-calculation.scss',
})
export class NewCalculation {
  private readonly formBuilder = inject(FormBuilder);
  private readonly catalogService = inject(CatalogService);
  private readonly calculationsService = inject(
    CommissionCalculationsService,
  );
  private readonly destroyRef = inject(DestroyRef);

  // Catálogos utilizados en los campos de selección.
  protected readonly groups = signal<Group[]>([]);
  protected readonly banks = signal<Bank[]>([]);

  // Estados relacionados con la carga de grupos y bancos.
  protected readonly isLoadingCatalogs = signal(true);
  protected readonly catalogError = signal<string | null>(null);

  // Estados relacionados con el registro de la liquidación.
  protected readonly isSubmitting = signal(false);
  protected readonly submitError = signal<string | null>(null);
  protected readonly registeredCalculation =
    signal<CommissionCalculation | null>(null);

  /**
   * Formulario principal de Nueva liquidación.
   *
   * Los valores iniciales de las comisiones corresponden
   * al caso habitual del sistema, pero pueden modificarse.
   */
  protected readonly calculationForm = this.formBuilder.group({
    groupId: this.formBuilder.control<number | null>(null, {
      validators: [Validators.required],
    }),

    bankId: this.formBuilder.control<number | null>(null, {
      validators: [Validators.required],
    }),

    collectionAmount: this.formBuilder.control<number | null>(null, {
      validators: [
        Validators.required,
        Validators.min(0.01),
        Validators.pattern(/^\d+([.,]\d{1,2})?$/),
      ],
    }),

    totalCommissionPercentage: this.formBuilder.control<number | null>(2.5, {
      validators: [
        Validators.required,
        Validators.min(0),
        Validators.max(100),
        Validators.pattern(/^\d+([.,]\d{1,2})?$/),
      ],
    }),

    clientCommissionPercentage: this.formBuilder.control<number | null>(1, {
      validators: [
        Validators.min(0),
        Validators.max(100),
        Validators.pattern(/^\d+([.,]\d{1,2})?$/),
      ],
    }),

    calculationDateTime: this.formBuilder.control<string>(
      this.getCurrentLocalDateTime(),
      {
        validators: [Validators.required],
      },
    ),

    notes: this.formBuilder.nonNullable.control('', {
      validators: [Validators.maxLength(300)],
    }),
  });

  constructor() {
    this.loadCatalogs();
  }

  /**
   * Carga grupos y bancos simultáneamente.
   */
  protected loadCatalogs(): void {
    this.isLoadingCatalogs.set(true);
    this.catalogError.set(null);

    forkJoin({
      groups: this.catalogService.getGroups(),
      banks: this.catalogService.getBanks(),
    })
      .pipe(
        finalize(() => this.isLoadingCatalogs.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: ({ groups, banks }) => {
          // Solamente se muestran opciones activas.
          this.groups.set(groups.filter((group) => group.active));
          this.banks.set(banks.filter((bank) => bank.active));
        },
        error: () => {
          this.catalogError.set(
            'No se pudieron cargar los grupos y bancos. Verificá que el backend esté funcionando.',
          );
        },
      });
  }

  /**
   * Registra la liquidación cuando el formulario es válido.
   */
  protected submitCalculation(): void {
    this.registeredCalculation.set(null);
    this.submitError.set(null);

    if (this.calculationForm.invalid) {
      this.calculationForm.markAllAsTouched();
      return;
    }

    const formValue = this.calculationForm.getRawValue();

    if (
      formValue.groupId === null ||
      formValue.bankId === null ||
      formValue.collectionAmount === null ||
      formValue.totalCommissionPercentage === null ||
      !formValue.calculationDateTime
    ) {
      return;
    }

    const selectedBank = this.banks().find(
      (bank) => bank.id === formValue.bankId,
    );

    if (!selectedBank) {
      this.submitError.set('El banco seleccionado no es válido.');
      this.focusFeedbackMessage();
      return;
    }

    const clientPercentage = formValue.clientCommissionPercentage ?? 0;

    // El banco y el cliente no pueden superar la comisión total.
    if (
      selectedBank.commissionPercentage + clientPercentage >
      formValue.totalCommissionPercentage
    ) {
      this.submitError.set(
        'La suma de la comisión bancaria y la comisión del cliente no puede superar la comisión total.',
      );
      this.focusFeedbackMessage();
      return;
    }

    const request: RegisterCommissionCalculation = {
      groupId: formValue.groupId,
      bankId: formValue.bankId,
      collectionAmount: formValue.collectionAmount,
      totalCommissionPercentage: formValue.totalCommissionPercentage,
      calculationDateTime: new Date(
        formValue.calculationDateTime,
      ).toISOString(),
    };

    // Las propiedades opcionales solamente se envían cuando tienen contenido.
    if (formValue.clientCommissionPercentage !== null) {
      request.clientCommissionPercentage =
        formValue.clientCommissionPercentage;
    }

    const trimmedNotes = formValue.notes.trim();

    if (trimmedNotes) {
      request.notes = trimmedNotes;
    }

    this.isSubmitting.set(true);
    this.calculationForm.disable();

    this.calculationsService
      .registerCalculation(request)
      .pipe(
        finalize(() => {
          this.isSubmitting.set(false);
          this.calculationForm.enable();
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (calculation) => {
          this.registeredCalculation.set(calculation);
          this.resetForm();
          this.focusFeedbackMessage();
        },
        error: (error: HttpErrorResponse) => {
          this.submitError.set(this.getErrorMessage(error));
          this.focusFeedbackMessage();
        },
      });
  }

  /**
   * Restablece el formulario conservando sus valores habituales.
   */
  protected resetForm(): void {
    this.calculationForm.reset({
      groupId: null,
      bankId: null,
      collectionAmount: null,
      totalCommissionPercentage: 2.5,
      clientCommissionPercentage: 1,
      calculationDateTime: this.getCurrentLocalDateTime(),
      notes: '',
    });
  }

  /**
 * Limpia el formulario, elimina los mensajes anteriores
 * y vuelve al encabezado de la pantalla.
 */
protected clearForm(): void {
  this.resetForm();
  this.submitError.set(null);
  this.registeredCalculation.set(null);

  document.getElementById('page-top')?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
}

/**
 * Desplaza la pantalla hasta el mensaje de respuesta y le da foco.
 *
 * Se espera al siguiente ciclo para que Angular haya incorporado
 * el mensaje al HTML.
 */
private focusFeedbackMessage(): void {
  setTimeout(() => {
    const feedbackMessage = document.getElementById('form-feedback');

    feedbackMessage?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });

    feedbackMessage?.focus({
      preventScroll: true,
    });
  });
}

  /**
   * Devuelve la fecha y hora local en el formato requerido
   * por un input de tipo datetime-local.
   */
  private getCurrentLocalDateTime(): string {
    const now = new Date();
    const timezoneOffset = now.getTimezoneOffset() * 60_000;

    return new Date(now.getTime() - timezoneOffset)
      .toISOString()
      .slice(0, 16);
  }

  /**
   * Intenta recuperar el mensaje de validación enviado por el backend.
   */
  private getErrorMessage(error: HttpErrorResponse): string {
    const backendMessage = error.error?.message;

    if (Array.isArray(backendMessage)) {
      return backendMessage.join(' ');
    }

    if (typeof backendMessage === 'string') {
      return backendMessage;
    }

    return 'No se pudo registrar la liquidación. Intentá nuevamente.';
  }
}