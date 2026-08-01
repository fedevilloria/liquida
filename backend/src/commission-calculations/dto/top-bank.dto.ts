import { ApiProperty } from '@nestjs/swagger';

/**
 * Representa al banco utilizado en la mayor cantidad
 * de liquidaciones dentro del período consultado.
 */
export class TopBankDto {
  @ApiProperty({
    description: 'Identificador del banco más utilizado.',
    example: 2,
  })
  id!: number;

  @ApiProperty({
    description: 'Nombre del banco más utilizado.',
    example: 'Banco Macro',
  })
  name!: string;

  @ApiProperty({
    description: 'Cantidad de liquidaciones en las que fue utilizado el banco.',
    example: 9,
  })
  calculationCount!: number;
}
