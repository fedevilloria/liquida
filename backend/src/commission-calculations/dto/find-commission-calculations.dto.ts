import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  Matches,
  Max,
  Min,
} from 'class-validator';

/**
 * Campos permitidos para ordenar el historial.
 */
export enum CommissionCalculationSortBy {
  CALCULATION_DATE_TIME = 'calculationDateTime',
  COLLECTION_AMOUNT = 'collectionAmount',
  TOTAL_COMMISSION_AMOUNT = 'totalCommissionAmount',
  CREATED_AT = 'createdAt',
}

/**
 * Direcciones permitidas para el ordenamiento.
 */
export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

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

  /**
   * Número de página solicitada.
   *
   * Si no se envía, se utiliza la primera página.
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt({
    message: 'La página debe ser un número entero.',
  })
  @Min(1, {
    message: 'La página debe ser mayor o igual a 1.',
  })
  page: number = 1;

  /**
   * Cantidad máxima de registros por página.
   *
   * El límite máximo evita consultas excesivamente grandes.
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt({
    message: 'El límite debe ser un número entero.',
  })
  @Min(1, {
    message: 'El límite debe ser mayor o igual a 1.',
  })
  @Max(100, {
    message: 'El límite no puede superar los 100 registros.',
  })
  limit: number = 10;

  /**
   * Campo utilizado para ordenar los resultados.
   */
  @IsOptional()
  @IsEnum(CommissionCalculationSortBy, {
    message:
      'El campo de ordenamiento debe ser calculationDateTime, collectionAmount, totalCommissionAmount o createdAt.',
  })
  sortBy: CommissionCalculationSortBy =
    CommissionCalculationSortBy.CALCULATION_DATE_TIME;

  /**
   * Dirección del ordenamiento.
   *
   * El valor se transforma a mayúsculas para aceptar
   * tanto "asc" como "ASC".
   */
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toUpperCase() : value,
  )
  @IsEnum(SortOrder, {
    message: 'La dirección de ordenamiento debe ser ASC o DESC.',
  })
  sortOrder: SortOrder = SortOrder.DESC;
}