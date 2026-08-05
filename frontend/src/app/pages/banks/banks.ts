import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { finalize } from 'rxjs';

import {
  Bank,
  BankRequest,
} from '../../core/models/catalog.model';
import { CatalogService } from '../../core/services/catalog';

@Component({
  selector: 'app-banks',
  imports: [ReactiveFormsModule],
  templateUrl: './banks.html',
  styleUrl: './banks.scss',
})
export class Banks implements OnInit {
  // Permite crear y administrar el formulario reactivo.
  private readonly formBuilder = inject(FormBuilder);

  // Servicio encargado de comunicarse con el backend.
  private readonly catalogService = inject(CatalogService);

  // Guarda todos los bancos, tanto activos como inactivos.
  protected readonly banks = signal<Bank[]>([]);

  // Indica si se está cargando el listado inicial.
  protected readonly isLoading = signal(true);

  // Indica si se está creando o modificando un banco.
  protected readonly isSaving = signal(false);

  // Guarda el ID del banco que se está desactivando o reactivando.
  protected readonly processingBankId = signal<number | null>(null);

  // Guarda el ID del banco que se está editando.
  protected readonly editingBankId = signal<number | null>(null);

  // Banco cuya desactivación está pendiente de confirmación.
  protected readonly bankPendingDeactivation = signal<Bank | null>(null);

  // Mensajes mostrados después de una operación.
  protected readonly successMessage = signal<string | null>(null);
  protected readonly errorMessage = signal<string | null>(null);

  // Formulario utilizado tanto para crear como para editar un banco.
  protected readonly bankForm = this.formBuilder.nonNullable.group({
    name: [
      '',
      [
        Validators.required,
        Validators.maxLength(100),
      ],
    ],
    commissionPercentage: [
      0,
      [
        Validators.required,
        Validators.min(0),
        Validators.max(100),

        // Permite como máximo dos cifras decimales.
        Validators.pattern(/^\d+([.,]\d{1,2})?$/),
      ],
    ],
  });

  // Se ejecuta automáticamente al abrir la pantalla.
  ngOnInit(): void {
    this.loadBanks();
  }

  // Indica si el formulario se encuentra en el modo edición.
  protected isEditing(): boolean {
    return this.editingBankId() !== null;
  }

  // Registra un nuevo banco o guarda los cambios del banco editado.
  protected submitBank(): void {
    this.clearMessages();

    if (this.bankForm.invalid) {
      this.bankForm.markAllAsTouched();
      return;
    }

    const name = this.bankForm.controls.name.value.trim();
    const commissionPercentage =
      Number(
        String(
          this.bankForm.controls.commissionPercentage.value,
        ).replace(',', '.'),
      );

    // Evita enviar un nombre compuesto únicamente por espacios.
    if (!name) {
      this.bankForm.controls.name.setErrors({ requiredname: true });
      this.bankForm.markAllAsTouched();
      return;
    }

    // Verifica nuevamente que el porcentaje sea un número válido.
    if (
      !Number.isFinite(commissionPercentage) ||
      commissionPercentage < 0 ||
      commissionPercentage > 100
    ) {
      this.bankForm.controls.commissionPercentage.setErrors({
        invalidPercentage: true,
      });
      this.bankForm.markAllAsTouched();
      return;
    }

    const request: BankRequest = {
      name,
      commissionPercentage,
    };

    const bankId = this.editingBankId();

    if (bankId === null) {
      this.createBank(request);
      return;
    }

    this.updateBank(bankId, request);
  }

  // Coloca los datos del banco seleccionado dentro del formulario.
  protected startEditing(bank: Bank): void {
    this.clearMessages();

    this.editingBankId.set(bank.id);

    this.bankForm.reset({
      name: bank.name,
      commissionPercentage: bank.commissionPercentage,
    });
  }

  // Cancela la edición y vuelve al modo de creación.
  protected cancelEditing(): void {
    this.editingBankId.set(null);

    this.resetForm();
    this.clearMessages();
  }

  // Abre la ventana de confirmación para desactivar un banco.
  protected requestBankDeactivation(bank: Bank): void {
    this.clearMessages();
    this.bankPendingDeactivation.set(bank);
  }

  // Cierra la ventana sin modificar el banco.
  protected cancelBankDeactivation(): void {
    this.bankPendingDeactivation.set(null);
  }

  // Confirma la desactivación del banco.
  protected confirmBankDeactivation(): void {
    const bank = this.bankPendingDeactivation();

    if (!bank) {
      return;
    }

    this.bankPendingDeactivation.set(null);
    this.processingBankId.set(bank.id);

    this.catalogService
      .deactivateBank(bank.id)
      .pipe(
        finalize(() => this.processingBankId.set(null)),
      )
      .subscribe({
        next: (updatedBank) => {
          this.replaceBank(updatedBank);

          this.successMessage.set(
            `El banco "${updatedBank.name}" fue desactivado correctamente.`,
          );

          // Si se estaba editando ese banco, cancela la edición.
          if (this.editingBankId() === updatedBank.id) {
            this.editingBankId.set(null);
            this.resetForm();
          }
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage.set(
            this.getErrorMessage(
              error,
              'No se pudo desactivar el banco.',
            ),
          );
        },
      });
  }

  // Reactiva un banco previamente desactivado.
  protected restoreBank(bank: Bank): void {
    this.clearMessages();
    this.processingBankId.set(bank.id);

    this.catalogService
      .restoreBank(bank.id)
      .pipe(
        finalize(() => this.processingBankId.set(null)),
      )
      .subscribe({
        next: (updatedBank) => {
          this.replaceBank(updatedBank);

          this.successMessage.set(
            `El banco "${updatedBank.name}" fue reactivado correctamente.`,
          );
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage.set(
            this.getErrorMessage(
              error,
              'No se pudo reactivar el banco.',
            ),
          );
        },
      });
  }

  // Permite volver a intentar cargar el listado si ocurrió un error.
  protected retry(): void {
    this.loadBanks();
  }

  // Solicita al backend todos los bancos registrados.
  private loadBanks(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.catalogService
      .getBanks()
      .pipe(
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe({
        next: (banks) => {
          this.banks.set(this.sortBanks(banks));
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error al cargar los bancos:', error);

          this.errorMessage.set(
            this.getErrorMessage(
              error,
              'No se pudo obtener el listado de bancos.',
            ),
          );
        },
      });
  }

  // Envía al backend los datos del nuevo banco.
  private createBank(request: BankRequest): void {
    this.isSaving.set(true);

    this.catalogService
      .createBank(request)
      .pipe(
        finalize(() => this.isSaving.set(false)),
      )
      .subscribe({
        next: (createdBank) => {
          this.banks.update((banks) =>
            this.sortBanks([...banks, createdBank]),
          );

          this.resetForm();

          this.successMessage.set(
            `El banco "${createdBank.name}" fue creado correctamente.`,
          );
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage.set(
            this.getErrorMessage(
              error,
              'No se pudo crear el banco.',
            ),
          );
        },
      });
  }

  // Envía al backend los nuevos datos del banco seleccionado.
  private updateBank(
    id: number,
    request: BankRequest,
  ): void {
    this.isSaving.set(true);

    this.catalogService
      .updateBank(id, request)
      .pipe(
        finalize(() => this.isSaving.set(false)),
      )
      .subscribe({
        next: (updatedBank) => {
          this.replaceBank(updatedBank);

          this.editingBankId.set(null);
          this.resetForm();

          this.successMessage.set(
            `El banco "${updatedBank.name}" fue modificado correctamente.`,
          );
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage.set(
            this.getErrorMessage(
              error,
              'No se pudo modificar el banco.',
            ),
          );
        },
      });
  }

  // Reemplaza un banco dentro del listado después de modificarlo.
  private replaceBank(updatedBank: Bank): void {
    this.banks.update((banks) =>
      this.sortBanks(
        banks.map((bank) =>
          bank.id === updatedBank.id ? updatedBank : bank,
        ),
      ),
    );
  }

  // Mantiene primero los bancos activos y luego los ordena por nombre.
  private sortBanks(banks: Bank[]): Bank[] {
    return [...banks].sort((firstBank, secondBank) => {
      if (firstBank.active !== secondBank.active) {
        return firstBank.active ? -1 : 1;
      }

      return firstBank.name.localeCompare(
        secondBank.name,
        'es',
        { sensitivity: 'base' },
      );
    });
  }

  // Limpia el formulario y vuelve a sus valores iniciales.
  private resetForm(): void {
    this.bankForm.reset({
      name: '',
      commissionPercentage: 0,
    });
  }

  // Limpia los mensajes correspondientes a operaciones anteriores.
  private clearMessages(): void {
    this.successMessage.set(null);
    this.errorMessage.set(null);
  }

  // Obtiene el mensaje enviado por NestJS o utiliza uno predeterminado.
  private getErrorMessage(
    error: HttpErrorResponse,
    fallbackMessage: string,
  ): string {
    const backendMessage = error.error?.message;

    if (Array.isArray(backendMessage)) {
      return backendMessage.join(' ');
    }

    if (typeof backendMessage === 'string') {
      return backendMessage;
    }

    return fallbackMessage;
  }
}