import { Column, Entity } from 'typeorm';

import { BaseEntity } from '../../common/entities/base.entity';

@Entity('banks')
export class Bank extends BaseEntity {
  // Nombre identificador del banco o medio de cobro.
  // Se define como único para evitar registros duplicados.
  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
  })
  name!: string;

  // Porcentaje de comisión cobrado por el banco.
  //
  // Se utiliza numeric porque los porcentajes requieren
  // precisión decimal y no deben almacenarse como float.
  @Column({
    type: 'numeric',
    precision: 5,
    scale: 2,
  })
  commissionPercentage!: number;

  // Permite desactivar un banco sin eliminarlo físicamente.
  // De esta manera se conservan los cálculos históricos asociados.
  @Column({
    type: 'boolean',
    default: true,
  })
  active!: boolean;
}