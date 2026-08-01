import { ApiProperty } from '@nestjs/swagger';

/**
 * Representa al grupo con mayor recaudación
 * dentro del período consultado.
 */
export class TopGroupDto {
  @ApiProperty({
    description: 'Identificador del grupo con mayor recaudación.',
    example: 1,
  })
  id!: number;

  @ApiProperty({
    description: 'Nombre del grupo con mayor recaudación.',
    example: 'Grupo Norte',
  })
  name!: string;

  @ApiProperty({
    description:
      'Recaudación total acumulada por el grupo dentro del período consultado.',
    example: 12000000,
  })
  totalCollectionAmount!: number;
}
