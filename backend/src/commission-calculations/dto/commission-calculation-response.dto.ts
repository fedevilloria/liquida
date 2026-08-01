import { ApiProperty } from '@nestjs/swagger';

import { CommissionCalculation } from '../entities/commission-calculation.entity';

/**
 * DTO utilizado para exponer una liquidación mediante la API.
 *
 * Evita devolver las entidades completas de Group y Bank,
 * ofreciendo una respuesta más simple y estable para el frontend.
 */
export class CommissionCalculationResponseDto {
  @ApiProperty({
    description: 'Identificador único de la liquidación.',
    example: 1,
    readOnly: true,
  })
  id!: number;

  @ApiProperty({
    description: 'Identificador del grupo asociado.',
    example: 1,
    readOnly: true,
  })
  groupId!: number;

  @ApiProperty({
    description: 'Nombre del grupo asociado.',
    example: 'Grupo Norte',
    readOnly: true,
  })
  groupName!: string;

  @ApiProperty({
    description: 'Identificador del banco utilizado.',
    example: 2,
    readOnly: true,
  })
  bankId!: number;

  @ApiProperty({
    description: 'Nombre del banco utilizado.',
    example: 'Banco Macro',
    readOnly: true,
  })
  bankName!: string;

  @ApiProperty({
    description: 'Monto total recaudado.',
    example: 2500000,
    readOnly: true,
  })
  collectionAmount!: number;

  @ApiProperty({
    description: 'Porcentaje total de comisión aplicado sobre la recaudación.',
    example: 2.5,
    readOnly: true,
  })
  totalCommissionPercentage!: number;

  @ApiProperty({
    description: 'Porcentaje de comisión cobrado por el banco.',
    example: 0.8,
    readOnly: true,
  })
  bankCommissionPercentage!: number;

  @ApiProperty({
    description: 'Porcentaje de comisión correspondiente al cliente.',
    example: 1,
    nullable: true,
    readOnly: true,
  })
  clientCommissionPercentage!: number | null;

  @ApiProperty({
    description: 'Porcentaje de comisión correspondiente a la organización.',
    example: 0.7,
    readOnly: true,
  })
  ownCommissionPercentage!: number;

  @ApiProperty({
    description: 'Importe total de la comisión.',
    example: 62500,
    readOnly: true,
  })
  totalCommissionAmount!: number;

  @ApiProperty({
    description: 'Importe correspondiente al banco.',
    example: 20000,
    readOnly: true,
  })
  bankCommissionAmount!: number;

  @ApiProperty({
    description: 'Importe correspondiente al cliente.',
    example: 25000,
    nullable: true,
    readOnly: true,
  })
  clientCommissionAmount!: number | null;

  @ApiProperty({
    description: 'Importe correspondiente a la organización.',
    example: 17500,
    readOnly: true,
  })
  ownCommissionAmount!: number;

  @ApiProperty({
    description: 'Fecha y hora de corte correspondiente a la liquidación.',
    example: '2026-07-30T18:00:00.000Z',
    type: String,
    format: 'date-time',
    readOnly: true,
  })
  calculationDateTime!: Date;

  @ApiProperty({
    description: 'Observación asociada a la liquidación.',
    example: 'Liquidación correspondiente al cierre de julio.',
    nullable: true,
    readOnly: true,
  })
  notes!: string | null;

  @ApiProperty({
    description: 'Fecha y hora en la que se registró la liquidación.',
    example: '2026-07-30T18:15:00.000Z',
    type: String,
    format: 'date-time',
    readOnly: true,
  })
  createdAt!: Date;

  /**
   * Convierte una entidad CommissionCalculation
   * en una respuesta simplificada para la API.
   */
  static fromEntity(
    calculation: CommissionCalculation,
  ): CommissionCalculationResponseDto {
    const response = new CommissionCalculationResponseDto();

    response.id = calculation.id;

    response.groupId = calculation.group.id;
    response.groupName = calculation.group.name;

    response.bankId = calculation.bank.id;
    response.bankName = calculation.bank.name;

    response.collectionAmount = calculation.collectionAmount;

    response.totalCommissionPercentage = calculation.totalCommissionPercentage;

    response.bankCommissionPercentage = calculation.bankCommissionPercentage;

    response.clientCommissionPercentage =
      calculation.clientCommissionPercentage;

    response.ownCommissionPercentage = calculation.ownCommissionPercentage;

    response.totalCommissionAmount = calculation.totalCommissionAmount;

    response.bankCommissionAmount = calculation.bankCommissionAmount;

    response.clientCommissionAmount = calculation.clientCommissionAmount;

    response.ownCommissionAmount = calculation.ownCommissionAmount;

    response.calculationDateTime = calculation.calculationDateTime;

    response.notes = calculation.notes;

    response.createdAt = calculation.createdAt;

    return response;
  }
}
