import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, Matches } from 'class-validator';

/**
 * DTO utilizado para validar el período solicitado
 * para las estadísticas del dashboard.
 */
export class DashboardFiltersDto {
  /**
   * Fecha inicial del período.
   *
   * Debe enviarse con formato YYYY-MM-DD.
   */
  @ApiPropertyOptional({
    description:
      'Fecha inicial del período. Incluye las liquidaciones desde el comienzo del día indicado.',
    example: '2026-07-01',
    type: String,
    format: 'date',
  })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'La fecha inicial debe tener el formato YYYY-MM-DD.',
  })
  from?: string;

  /**
   * Fecha final del período.
   *
   * Debe enviarse con formato YYYY-MM-DD.
   */
  @ApiPropertyOptional({
    description:
      'Fecha final del período. Incluye las liquidaciones hasta el final del día indicado.',
    example: '2026-07-31',
    type: String,
    format: 'date',
  })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'La fecha final debe tener el formato YYYY-MM-DD.',
  })
  to?: string;
}
