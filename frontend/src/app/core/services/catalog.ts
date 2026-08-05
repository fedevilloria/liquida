import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  Bank,
  Group,
  GroupRequest,
} from '../models/catalog.model';

@Injectable({
  providedIn: 'root',
})
export class CatalogService {
  private readonly http = inject(HttpClient);

  // URLs de los catálogos del backend durante el desarrollo local.
  private readonly groupsUrl = 'http://localhost:3000/groups';
  private readonly banksUrl = 'http://localhost:3000/banks';

  /**
   * Obtiene todos los grupos registrados.
   *
   * Incluye tanto los grupos activos como los inactivos,
   * por lo que se utiliza en la pantalla administrativa.
   */
  getGroups(): Observable<Group[]> {
    return this.http.get<Group[]>(this.groupsUrl);
  }

  /**
   * Obtiene únicamente los grupos activos.
   *
   * Se utiliza en los campos donde solamente pueden seleccionarse
   * grupos disponibles para nuevas liquidaciones.
   */
  getActiveGroups(): Observable<Group[]> {
    return this.http.get<Group[]>(`${this.groupsUrl}/active`);
  }

  /**
   * Registra un nuevo grupo.
   */
  createGroup(group: GroupRequest): Observable<Group> {
    return this.http.post<Group>(this.groupsUrl, group);
  }

  /**
   * Modifica el nombre de un grupo existente.
   */
  updateGroup(id: number, group: GroupRequest): Observable<Group> {
    return this.http.patch<Group>(`${this.groupsUrl}/${id}`, group);
  }

  /**
   * Desactiva un grupo sin eliminar su información histórica.
   */
  deactivateGroup(id: number): Observable<Group> {
    return this.http.delete<Group>(`${this.groupsUrl}/${id}`);
  }

  /**
   * Reactiva un grupo previamente desactivado.
   *
   * El cuerpo vacío es necesario porque se trata de una solicitud PATCH.
   */
  restoreGroup(id: number): Observable<Group> {
    return this.http.patch<Group>(
      `${this.groupsUrl}/${id}/restore`,
      {},
    );
  }

  /**
   * Obtiene todos los bancos registrados.
   */
  getBanks(): Observable<Bank[]> {
    return this.http.get<Bank[]>(this.banksUrl);
  }
}