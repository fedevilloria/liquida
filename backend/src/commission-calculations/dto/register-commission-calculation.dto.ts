import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, TransformFnParams, Type } from 'class-transformer';
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
  @ApiProperty({
    description: 'Identificador del grupo asociado a la recaudación.',
    example: 1,
    minimum: 1,
  })
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
  @ApiProperty({
    description:
      'Identificador del banco cuya comisión se utilizará en la liquidación.',
    example: 2,
    minimum: 1,
  })
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
  @ApiProperty({
    description: 'Monto total recaudado por el grupo.',
    example: 2500000,
    minimum: 0.01,
    multipleOf: 0.01,
  })
  @Type(() => Number)
  @IsNumber(
    {
      maxDecimalPlaces: 2,
    },
    {
      message: 'El monto recaudado debe ser un número con hasta 2 decimales.',
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
  @ApiProperty({
    description:
      'Porcentaje total de comisión aplicado sobre el monto recaudado.',
    example: 2.5,
    minimum: 0,
    maximum: 100,
    multipleOf: 0.01,
  })
  @Type(() => Number)
  @IsNumber(
    {
      maxDecimalPlaces: 2,
    },
    {
      message: 'La comisión total debe ser un número con hasta 2 decimales.',
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
  @ApiPropertyOptional({
    description:
      'Porcentaje de comisión correspondiente al cliente. Cuando se omite, se considera cero para el cálculo.',
    example: 1,
    minimum: 0,
    maximum: 100,
    multipleOf: 0.01,
  })
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
  @ApiProperty({
    description:
      'Fecha y hora de corte hasta la cual se consideran los comprobantes incluidos.',
    example: '2026-07-30T18:00:00.000Z',
    type: String,
    format: 'date-time',
  })
  @Type(() => Date)
  @IsDate({
    message: 'La fecha y hora de corte debe tener un formato válido.',
  })
  calculationDateTime!: Date;

  /**
   * Observación opcional asociada a la liquidación.
   *
   * Se eliminan los espacios innecesarios ubicados
   * al comienzo y al final del texto.
   */
  @ApiPropertyOptional({
    description: 'Observación opcional asociada a la liquidación.',
    example: 'Liquidación correspondiente al cierre de julio.',
    maxLength: 300,
  })
  @IsOptional()
  @Transform(({ value }: TransformFnParams): unknown =>
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
