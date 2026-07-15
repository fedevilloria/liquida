import { Column, Entity } from 'typeorm';
import { numericTransformer } from '../../common/transformers/numeric.transformer';
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
  // Se utiliza numeric para conservar precisión decimal
  // y el transformer convierte el valor recibido desde PostgreSQL
  // en un número de JavaScript.
  @Column({
    type: 'numeric',
    precision: 5,
    scale: 2,
    transformer: numericTransformer,
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