import { ApiProperty } from '@nestjs/swagger';

import { TopBankDto } from './top-bank.dto';
import { TopGroupDto } from './top-group.dto';

/**
 * Representa las estadísticas generales
 * del dashboard de liquidaciones.
 */
export class CommissionDashboardResponseDto {
  @ApiProperty({
    description:
      'Fecha inicial utilizada para calcular las estadísticas. Es null cuando no se aplicó este filtro.',
    example: '2026-07-01',
    nullable: true,
    type: String,
    format: 'date',
  })
  from!: string | null;

  @ApiProperty({
    description:
      'Fecha final utilizada para calcular las estadísticas. Es null cuando no se aplicó este filtro.',
    example: '2026-07-31',
    nullable: true,
    type: String,
    format: 'date',
  })
  to!: string | null;

  @ApiProperty({
    description:
      'Cantidad total de liquidaciones incluidas en las estadísticas.',
    example: 15,
  })
  calculationCount!: number;

  @ApiProperty({
    description: 'Suma total de los importes recaudados.',
    example: 25000000,
  })
  totalCollectionAmount!: number;

  @ApiProperty({
    description: 'Suma total de las comisiones cobradas.',
    example: 625000,
  })
  totalCommissionAmount!: number;

  @ApiProperty({
    description: 'Suma total de las comisiones correspondientes a los bancos.',
    example: 200000,
  })
  bankCommissionAmount!: number;

  @ApiProperty({
    description:
      'Suma total de las comisiones correspondientes a los clientes.',
    example: 250000,
  })
  clientCommissionAmount!: number;

  @ApiProperty({
    description:
      'Suma total de las comisiones correspondientes a la organización.',
    example: 175000,
  })
  ownCommissionAmount!: number;

  @ApiProperty({
    description: 'Promedio de recaudación por liquidación.',
    example: 1666666.67,
  })
  averageCollectionAmount!: number;

  @ApiProperty({
    description:
      'Grupo con mayor recaudación dentro del período. Es null cuando no existen liquidaciones.',
    type: TopGroupDto,
    nullable: true,
    example: {
      id: 1,
      name: 'Grupo Norte',
      totalCollectionAmount: 12000000,
    },
  })
  topGroup!: TopGroupDto | null;

  @ApiProperty({
    description:
      'Banco utilizado en la mayor cantidad de liquidaciones. Es null cuando no existen liquidaciones.',
    type: TopBankDto,
    nullable: true,
    example: {
      id: 2,
      name: 'Banco Macro',
      calculationCount: 9,
    },
  })
  topBank!: TopBankDto | null;
}
