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