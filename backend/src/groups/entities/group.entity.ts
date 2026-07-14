import { Column, Entity } from 'typeorm';

import { BaseEntity } from '../../common/entities/base.entity';

@Entity('groups')
export class Group extends BaseEntity {
  // El valor será asignado al crear la entidad
  // a partir de los datos recibidos en el DTO.
  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
  })
  name!: string;

  // PostgreSQL utilizará true como valor predeterminado
  // cuando no se indique otro valor al crear el registro.
  @Column({
    type: 'boolean',
    default: true,
  })
  active!: boolean;
}