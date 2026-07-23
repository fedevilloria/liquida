import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsPositive,
  Matches,
} from 'class-validator';

/**
 * DTO utilizado para validar los filtros opcionales
 * del historial de liquidaciones.
 *
 * Al ser parámetros de consulta, todos los campos
 * pueden omitirse y combinarse libremente.
 */
export class FindCommissionCalculationsDto {
  /**
   * Filtra las liquidaciones pertenecientes
   * a un grupo específico.
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt({
    message: 'El identificador del grupo debe ser un número entero.',
  })
  @IsPositive({
    message: 'El identificador del grupo debe ser mayor que cero.',
  })
  groupId?: number;

  /**
   * Filtra las liquidaciones realizadas
   * utilizando un banco específico.
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt({
    message: 'El identificador del banco debe ser un número entero.',
  })
  @IsPositive({
    message: 'El identificador del banco debe ser mayor que cero.',
  })
  bankId?: number;

  /**
   * Fecha inicial del período consultado.
   *
   * Se recibe sin hora porque representa el comienzo
   * completo del día indicado.
   */
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'La fecha inicial debe tener el formato YYYY-MM-DD.',
  })
  from?: string;

  /**
   * Fecha final del período consultado.
   *
   * El servicio incluirá todo el día indicado,
   * hasta las 23:59:59.999.
   */
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'La fecha final debe tener el formato YYYY-MM-DD.',
  })
  to?: string;
}