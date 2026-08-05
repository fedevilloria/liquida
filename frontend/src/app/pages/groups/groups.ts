import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { finalize } from 'rxjs';

import {
  Group,
  GroupRequest,
} from '../../core/models/catalog.model';
import { CatalogService } from '../../core/services/catalog';

@Component({
  selector: 'app-groups',
  imports: [ReactiveFormsModule],
  templateUrl: './groups.html',
  styleUrl: './groups.scss',
})
export class Groups implements OnInit {
  // Permite crear y administrar el formulario reactivo.
  private readonly formBuilder = inject(FormBuilder);

  // Servicio encargado de comunicarse con el backend.
  private readonly catalogService = inject(CatalogService);

  // Guarda todos los grupos, tanto activos como inactivos.
  protected readonly groups = signal<Group[]>([]);

  // Indica si se está cargando el listado inicial.
  protected readonly isLoading = signal(true);

  // Indica si se está creando o modificando un grupo.
  protected readonly isSaving = signal(false);

  // Guarda el ID del grupo que se está desactivando o reactivando.
  protected readonly processingGroupId = signal<number | null>(null);

  // Guarda el ID del grupo que se está editando.
  protected readonly editingGroupId = signal<number | null>(null);

  // Mensajes mostrados después de una operación.
  protected readonly successMessage = signal<string | null>(null);
  protected readonly errorMessage = signal<string | null>(null);

  // Formulario utilizado tanto para crear como para editar un grupo.
  protected readonly groupForm = this.formBuilder.nonNullable.group({
    name: [
      '',
      [
        Validators.required,
        Validators.maxLength(100),
      ],
    ],
  });

  // Se ejecuta automáticamente al abrir la pantalla.
  ngOnInit(): void {
    this.loadGroups();
  }

  // Indica si el formulario se encuentra en modo edición.
  protected isEditing(): boolean {
    return this.editingGroupId() !== null;
  }

  // Registra un nuevo grupo o guarda los cambios del grupo editado.
  protected submitGroup(): void {
    this.clearMessages();

    if (this.groupForm.invalid) {
      this.groupForm.markAllAsTouched();
      return;
    }

    const request: GroupRequest = {
      name: this.groupForm.controls.name.value.trim(),
    };

    // Evita enviar un nombre compuesto únicamente por espacios.
    if (!request.name) {
      this.groupForm.controls.name.setErrors({ required: true });
      this.groupForm.markAllAsTouched();
      return;
    }

    const groupId = this.editingGroupId();

    if (groupId === null) {
      this.createGroup(request);
      return;
    }

    this.updateGroup(groupId, request);
  }

  // Coloca los datos del grupo seleccionado dentro del formulario.
  protected startEditing(group: Group): void {
    this.clearMessages();

    this.editingGroupId.set(group.id);

    this.groupForm.reset({
      name: group.name,
    });
  }

  // Cancela la edición y vuelve al modo de creación.
  protected cancelEditing(): void {
    this.editingGroupId.set(null);

    this.groupForm.reset({
      name: '',
    });

    this.clearMessages();
  }

  // Desactiva un grupo sin eliminar su información histórica.
  // Abre la ventana de confirmación antes de desactivar un grupo.
  protected requestGroupDeactivation(group: Group): void {
    this.clearMessages();
    this.groupPendingDeactivation.set(group);
  }

  // Cierra la ventana sin modificar el grupo.
  protected cancelGroupDeactivation(): void {
    this.groupPendingDeactivation.set(null);
  }

  // Confirma la operación y solicita la desactivación al backend.
  protected confirmGroupDeactivation(): void {
    const group = this.groupPendingDeactivation();

    // Evita realizar la operación si no existe un grupo pendiente.
    if (!group) {
      return;
    }

    this.groupPendingDeactivation.set(null);
    this.processingGroupId.set(group.id);

    this.catalogService
      .deactivateGroup(group.id)
      .pipe(
        finalize(() => this.processingGroupId.set(null)),
      )
      .subscribe({
        next: (updatedGroup) => {
          this.replaceGroup(updatedGroup);

          this.successMessage.set(
            `El grupo "${updatedGroup.name}" fue desactivado correctamente.`,
          );

          // Si se estaba editando ese grupo, cancela la edición.
          if (this.editingGroupId() === updatedGroup.id) {
            this.cancelEditing();

            // cancelEditing limpia los mensajes, por eso se establece nuevamente.
            this.successMessage.set(
              `El grupo "${updatedGroup.name}" fue desactivado correctamente.`,
            );
          }
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage.set(
            this.getErrorMessage(
              error,
              'No se pudo desactivar el grupo.',
            ),
          );
        },
      });
  }

  // Grupo cuya desactivación está pendiente de confirmación.
  protected readonly groupPendingDeactivation = signal<Group | null>(null);

  // Reactiva un grupo previamente desactivado.
  protected restoreGroup(group: Group): void {
    this.clearMessages();
    this.processingGroupId.set(group.id);

    this.catalogService
      .restoreGroup(group.id)
      .pipe(
        finalize(() => this.processingGroupId.set(null)),
      )
      .subscribe({
        next: (updatedGroup) => {
          this.replaceGroup(updatedGroup);

          this.successMessage.set(
            `El grupo "${updatedGroup.name}" fue reactivado correctamente.`,
          );
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage.set(
            this.getErrorMessage(
              error,
              'No se pudo reactivar el grupo.',
            ),
          );
        },
      });
  }

  // Permite volver a intentar cargar el listado si ocurrió un error.
  protected retry(): void {
    this.loadGroups();
  }

  // Solicita al backend todos los grupos registrados.
  private loadGroups(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.catalogService
      .getGroups()
      .pipe(
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe({
        next: (groups) => {
          this.groups.set(groups);
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error al cargar los grupos:', error);

          this.errorMessage.set(
            this.getErrorMessage(
              error,
              'No se pudo obtener el listado de grupos.',
            ),
          );
        },
      });
  }

  // Envía al backend los datos del nuevo grupo.
  private createGroup(request: GroupRequest): void {
    this.isSaving.set(true);

    this.catalogService
      .createGroup(request)
      .pipe(
        finalize(() => this.isSaving.set(false)),
      )
      .subscribe({
        next: (createdGroup) => {
          this.groups.update((groups) =>
            this.sortGroups([...groups, createdGroup]),
          );

          this.groupForm.reset({
            name: '',
          });

          this.successMessage.set(
            `El grupo "${createdGroup.name}" fue creado correctamente.`,
          );
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage.set(
            this.getErrorMessage(
              error,
              'No se pudo crear el grupo.',
            ),
          );
        },
      });
  }

  // Envía al backend el nuevo nombre del grupo seleccionado.
  private updateGroup(
    id: number,
    request: GroupRequest,
  ): void {
    this.isSaving.set(true);

    this.catalogService
      .updateGroup(id, request)
      .pipe(
        finalize(() => this.isSaving.set(false)),
      )
      .subscribe({
        next: (updatedGroup) => {
          this.replaceGroup(updatedGroup);

          this.editingGroupId.set(null);

          this.groupForm.reset({
            name: '',
          });

          this.successMessage.set(
            `El grupo "${updatedGroup.name}" fue modificado correctamente.`,
          );
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage.set(
            this.getErrorMessage(
              error,
              'No se pudo modificar el grupo.',
            ),
          );
        },
      });
  }

  // Reemplaza un grupo dentro del listado después de modificar su estado.
  private replaceGroup(updatedGroup: Group): void {
    this.groups.update((groups) =>
      this.sortGroups(
        groups.map((group) =>
          group.id === updatedGroup.id ? updatedGroup : group,
        ),
      ),
    );
  }

  // Mantiene primero los grupos activos y luego los ordena por nombre.
  private sortGroups(groups: Group[]): Group[] {
    return [...groups].sort((firstGroup, secondGroup) => {
      if (firstGroup.active !== secondGroup.active) {
        return firstGroup.active ? -1 : 1;
      }

      return firstGroup.name.localeCompare(
        secondGroup.name,
        'es',
        { sensitivity: 'base' },
      );
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