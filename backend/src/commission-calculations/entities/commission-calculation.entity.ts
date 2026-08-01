import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { Bank } from '../../banks/entities/bank.entity';
import { BaseEntity } from '../../common/entities/base.entity';
import { numericTransformer } from '../../common/transformers/numeric.transformer';
import { Group } from '../../groups/entities/group.entity';

@Entity('commission_calculations')
export class CommissionCalculation extends BaseEntity {
  // Monto total recaudado por el grupo.
  @Column({
    type: 'numeric',
    precision: 15,
    scale: 2,
    transformer: numericTransformer,
  })
  collectionAmount!: number;

  // Porcentaje total cobrado sobre la recaudación.
  // Se guarda como una copia histórica del valor utilizado.
  @Column({
    type: 'numeric',
    precision: 5,
    scale: 2,
    transformer: numericTransformer,
  })
  totalCommissionPercentage!: number;

  // Porcentaje cobrado por el banco al momento del cálculo.
  // No depende de futuros cambios realizados en la entidad Bank.
  @Column({
    type: 'numeric',
    precision: 5,
    scale: 2,
    transformer: numericTransformer,
  })
  bankCommissionPercentage!: number;

  // Porcentaje asignado al cliente.
  // Puede ser nulo porque no todos los grupos utilizan esta comisión.
  @Column({
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    transformer: numericTransformer,
  })
  clientCommissionPercentage!: number | null;

  // Porcentaje neto correspondiente a la empresa.
  @Column({
    type: 'numeric',
    precision: 5,
    scale: 2,
    transformer: numericTransformer,
  })
  ownCommissionPercentage!: number;

  // Importe correspondiente a la comisión total.
  @Column({
    type: 'numeric',
    precision: 15,
    scale: 2,
    transformer: numericTransformer,
  })
  totalCommissionAmount!: number;

  // Importe correspondiente al banco.
  @Column({
    type: 'numeric',
    precision: 15,
    scale: 2,
    transformer: numericTransformer,
  })
  bankCommissionAmount!: number;

  // Importe correspondiente al cliente.
  // Es nulo cuando el cálculo no incluye comisión del cliente.
  @Column({
    type: 'numeric',
    precision: 15,
    scale: 2,
    nullable: true,
    transformer: numericTransformer,
  })
  clientCommissionAmount!: number | null;

  // Importe neto correspondiente a la empresa.
  @Column({
    type: 'numeric',
    precision: 15,
    scale: 2,
    transformer: numericTransformer,
  })
  ownCommissionAmount!: number;

  // Fecha a la que corresponde la liquidación.
  //
  // Puede ser diferente de createdAt, ya que el registro
  // podría cargarse días después de realizada la recaudación.
  @Column({
    type: 'timestamp',
  })
  calculationDateTime!: Date;

  // Observación opcional asociada al cálculo.
  //
  // Permite registrar aclaraciones que faciliten
  // la interpretación posterior del historial.
  @Column({
    type: 'varchar',
    length: 300,
    nullable: true,
  })
  notes!: string | null;

  // Grupo al que pertenece el cálculo.
  // Un grupo puede tener múltiples cálculos históricos.
  @ManyToOne(() => Group, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'groupId',
  })
  group!: Group;

  // Banco cuya comisión fue utilizada en el cálculo.
  // Se restringe su eliminación física para preservar el historial.
  @ManyToOne(() => Bank, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'bankId',
  })
  bank!: Bank;
}
