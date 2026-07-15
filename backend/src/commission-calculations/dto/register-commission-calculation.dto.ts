import { Transform, Type } from 'class-transformer';
import {
  IsDate,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

/**
 * DTO utilizado para registrar una liquidación individual.
 *
 * Contiene solamente los datos que debe proporcionar el usuario.
 * Los porcentajes e importes resultantes serán calculados
 * exclusivamente por el backend.
 */
export class RegisterCommissionCalculationDto {
  /**
   * Identificador del grupo asociado a la recaudación.
   */
  @Type(() => Number)
  @IsInt({
    message: 'El identificador del grupo debe ser un número entero.',
  })
  @IsPositive({
    message: 'El identificador del grupo debe ser mayor que cero.',
  })
  groupId!: number;

  /**
   * Identificador del banco cuya comisión será utilizada.
   */
  @Type(() => Number)
  @IsInt({
    message: 'El identificador del banco debe ser un número entero.',
  })
  @IsPositive({
    message: 'El identificador del banco debe ser mayor que cero.',
  })
  bankId!: number;

  /**
   * Monto total recaudado por el grupo.
   *
   * Se permiten hasta dos decimales porque representa
   * un importe monetario.
   */
  @Type(() => Number)
  @IsNumber(
    {
      maxDecimalPlaces: 2,
    },
    {
      message:
        'El monto recaudado debe ser un número con hasta 2 decimales.',
    },
  )
  @Min(0.01, {
    message: 'El monto recaudado debe ser mayor que cero.',
  })
  collectionAmount!: number;

  /**
   * Porcentaje total de comisión aplicado
   * sobre el monto recaudado.
   */
  @Type(() => Number)
  @IsNumber(
    {
      maxDecimalPlaces: 2,
    },
    {
      message:
        'La comisión total debe ser un número con hasta 2 decimales.',
    },
  )
  @Min(0, {
    message: 'La comisión total no puede ser negativa.',
  })
  @Max(100, {
    message: 'La comisión total no puede superar el 100%.',
  })
  totalCommissionPercentage!: number;

  /**
   * Porcentaje opcional correspondiente al cliente.
   *
   * Cuando no se envía, el sistema realizará el cálculo
   * considerando que la comisión del cliente es cero.
   */
  @IsOptional()
  @Type(() => Number)
  @IsNumber(
    {
      maxDecimalPlaces: 2,
    },
    {
      message:
        'La comisión del cliente debe ser un número con hasta 2 decimales.',
    },
  )
  @Min(0, {
    message: 'La comisión del cliente no puede ser negativa.',
  })
  @Max(100, {
    message: 'La comisión del cliente no puede superar el 100%.',
  })
  clientCommissionPercentage?: number;

  /**
   * Fecha y hora hasta la cual se consideran
   * los comprobantes incluidos en la liquidación.
   *
   * Type convierte la fecha recibida en formato ISO
   * a una instancia de Date.
   */
  @Type(() => Date)
  @IsDate({
    message:
      'La fecha y hora de corte debe tener un formato válido.',
  })
  calculationDateTime!: Date;

  /**
   * Observación opcional asociada a la liquidación.
   *
   * Se eliminan los espacios innecesarios ubicados
   * al comienzo y al final del texto.
   */
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString({
    message: 'Las observaciones deben ser un texto.',
  })
  @MaxLength(300, {
    message: 'Las observaciones no pueden superar los 300 caracteres.',
  })
  notes?: string;
}