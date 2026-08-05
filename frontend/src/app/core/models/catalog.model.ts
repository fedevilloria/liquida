/**
 * Representa un grupo disponible en el sistema.
 */
export interface Group {
  id: number;
  createdAt: string;
  updatedAt: string;
  name: string;
  active: boolean;
}

/**
 * Representa los datos enviados al crear o modificar un grupo.
 */
export interface GroupRequest {
  name: string;
}

/**
 * Representa un banco disponible en el sistema.
 */
export interface Bank {
  id: number;
  createdAt: string;
  updatedAt: string;
  name: string;
  commissionPercentage: number;
  active: boolean;
}

/**
 * Representa los datos enviados al crear o modificar un banco.
 */
export interface BankRequest {
  name: string;
  commissionPercentage: number;
}