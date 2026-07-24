import { CommissionCalculationResponseDto } from './commission-calculation-response.dto';

/**
 * Metadatos de paginación devueltos junto con los resultados.
 */
export class PaginationMetadataDto {
  /**
   * Página actual.
   */
  page!: number;

  /**
   * Cantidad máxima de registros por página.
   */
  limit!: number;

  /**
   * Cantidad total de registros que cumplen los filtros.
   */
  totalItems!: number;

  /**
   * Cantidad total de páginas disponibles.
   */
  totalPages!: number;

  /**
   * Indica si existe una página anterior.
   */
  hasPreviousPage!: boolean;

  /**
   * Indica si existe una página siguiente.
   */
  hasNextPage!: boolean;
}

/**
 * Respuesta paginada del historial de liquidaciones.
 */
export class PaginatedCommissionCalculationResponseDto {
  /**
   * Liquidaciones correspondientes a la página solicitada.
   */
  data!: CommissionCalculationResponseDto[];

  /**
   * Información necesaria para navegar entre páginas.
   */
  pagination!: PaginationMetadataDto;
}