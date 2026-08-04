/**
 * Datos que el frontend envía al backend para registrar
 * una nueva liquidación.
 */
export interface RegisterCommissionCalculation {
  groupId: number;
  bankId: number;
  collectionAmount: number;
  totalCommissionPercentage: number;
  clientCommissionPercentage?: number;
  calculationDateTime: string;
  notes?: string;
}

/**
 * Liquidación devuelta por el backend después de registrarla.
 *
 * La respuesta incluye los porcentajes e importes calculados
 * exclusivamente por el backend.
 */
export interface CommissionCalculation {
  id: number;

  groupId: number;
  groupName: string;

  bankId: number;
  bankName: string;

  collectionAmount: number;

  totalCommissionPercentage: number;
  bankCommissionPercentage: number;
  clientCommissionPercentage: number | null;
  ownCommissionPercentage: number;

  totalCommissionAmount: number;
  bankCommissionAmount: number;
  clientCommissionAmount: number | null;
  ownCommissionAmount: number;

  calculationDateTime: string;
  notes: string | null;
  createdAt: string;
}

/**
 * Filtros que pueden enviarse al consultar el historial.
 */
export interface CommissionCalculationFilters {
  groupId?: number;
  bankId?: number;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

/**
 * Información utilizada para navegar entre las páginas
 * del historial de liquidaciones.
 */
export interface CommissionCalculationPagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

/**
 * Respuesta paginada devuelta por el historial.
 */
export interface CommissionCalculationsResponse {
  data: CommissionCalculation[];
  pagination: CommissionCalculationPagination;
}