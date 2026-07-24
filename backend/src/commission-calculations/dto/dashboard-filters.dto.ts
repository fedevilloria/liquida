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
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'La fecha final debe tener el formato YYYY-MM-DD.',
  })
  to?: string;
}