import { ApiProperty } from '@nestjs/swagger';

import { CommissionCalculationResponseDto } from './commission-calculation-response.dto';

/**
 * Metadatos de paginación devueltos junto con los resultados.
 */
export class PaginationMetadataDto {
  /**
   * Página actual.
   */
  @ApiProperty({
    description: 'Página actual.',
    example: 1,
  })
  page!: number;

  /**
   * Cantidad máxima de registros por página.
   */
  @ApiProperty({
    description: 'Cantidad máxima de registros por página.',
    example: 10,
  })
  limit!: number;

  /**
   * Cantidad total de registros que cumplen los filtros.
   */
  @ApiProperty({
    description:
      'Cantidad total de liquidaciones que cumplen los filtros aplicados.',
    example: 53,
  })
  totalItems!: number;

  /**
   * Cantidad total de páginas disponibles.
   */
  @ApiProperty({
    description: 'Cantidad total de páginas disponibles para la consulta.',
    example: 6,
  })
  totalPages!: number;

  /**
   * Indica si existe una página anterior.
   */
  @ApiProperty({
    description: 'Indica si existe una página anterior a la actual.',
    example: false,
  })
  hasPreviousPage!: boolean;

  /**
   * Indica si existe una página siguiente.
   */
  @ApiProperty({
    description: 'Indica si existe una página siguiente a la actual.',
    example: true,
  })
  hasNextPage!: boolean;
}

/**
 * Respuesta paginada del historial de liquidaciones.
 */
export class PaginatedCommissionCalculationResponseDto {
  /**
   * Liquidaciones correspondientes a la página solicitada.
   */
  @ApiProperty({
    description: 'Liquidaciones correspondientes a la página solicitada.',
    type: CommissionCalculationResponseDto,
    isArray: true,
  })
  data!: CommissionCalculationResponseDto[];

  /**
   * Información necesaria para navegar entre páginas.
   */
  @ApiProperty({
    description: 'Metadatos de la paginación.',
    type: PaginationMetadataDto,
  })
  pagination!: PaginationMetadataDto;
}
