import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity } from 'typeorm';

import { BaseEntity } from '../../common/entities/base.entity';
import { numericTransformer } from '../../common/transformers/numeric.transformer';

@Entity('banks')
export class Bank extends BaseEntity {
  /**
   * Nombre identificador del banco o medio de cobro.
   */
  @ApiProperty({
    description: 'Nombre identificador del banco o medio de cobro.',
    example: 'Banco Macro',
    maxLength: 100,
  })
  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
  })
  name!: string;

  /**
   * Porcentaje de comisión cobrado por el banco.
   */
  @ApiProperty({
    description: 'Porcentaje de comisión cobrado por el banco.',
    example: 0.8,
    minimum: 0,
    maximum: 100,
  })
  @Column({
    type: 'numeric',
    precision: 5,
    scale: 2,
    transformer: numericTransformer,
  })
  commissionPercentage!: number;

  /**
   * Indica si el banco se encuentra disponible
   * para utilizarse en nuevas liquidaciones.
   */
  @ApiProperty({
    description:
      'Indica si el banco se encuentra activo y disponible para nuevas liquidaciones.',
    example: true,
    default: true,
  })
  @Column({
    type: 'boolean',
    default: true,
  })
  active!: boolean;
}
