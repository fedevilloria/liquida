import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity } from 'typeorm';

import { BaseEntity } from '../../common/entities/base.entity';

@Entity('groups')
export class Group extends BaseEntity {
  /**
   * Nombre identificador del grupo.
   */
  @ApiProperty({
    description: 'Nombre identificador del grupo.',
    example: 'Grupo Norte',
    maxLength: 100,
  })
  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
  })
  name!: string;

  /**
   * Indica si el grupo se encuentra disponible
   * para utilizarse en nuevas liquidaciones.
   */
  @ApiProperty({
    description:
      'Indica si el grupo se encuentra activo y disponible para nuevas liquidaciones.',
    example: true,
    default: true,
  })
  @Column({
    type: 'boolean',
    default: true,
  })
  active!: boolean;
}
