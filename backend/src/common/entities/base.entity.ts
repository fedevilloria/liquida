import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Clase base que concentra los atributos comunes
 * que tendrán las entidades principales del sistema.
 *
 * Al utilizar herencia evitamos repetir estos campos
 * en Group, Bank y CommissionCalculation.
 */
export abstract class BaseEntity {
  // TypeORM y PostgreSQL asignarán este valor
  // cuando el registro sea persistido en la base de datos.
  @PrimaryGeneratedColumn()
  id!: number;

  // TypeORM asignará automáticamente la fecha de creación
  // cuando el registro sea guardado por primera vez.
  @CreateDateColumn({
    type: 'timestamp',
  })
  createdAt!: Date;

  // TypeORM actualizará automáticamente esta fecha
  // cada vez que el registro sea modificado.
  @UpdateDateColumn({
    type: 'timestamp',
  })
  updatedAt!: Date;
}