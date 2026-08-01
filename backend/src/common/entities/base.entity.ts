import { ApiProperty } from '@nestjs/swagger';
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
  /**
   * Identificador único generado automáticamente
   * al persistir el registro.
   */
  @ApiProperty({
    description: 'Identificador único del registro.',
    example: 1,
    type: Number,
    readOnly: true,
  })
  @PrimaryGeneratedColumn()
  id!: number;

  /**
   * Fecha y hora en la que se creó el registro.
   */
  @ApiProperty({
    description: 'Fecha y hora de creación del registro.',
    example: '2026-07-30T13:30:00.000Z',
    type: String,
    format: 'date-time',
    readOnly: true,
  })
  @CreateDateColumn({
    type: 'timestamp',
  })
  createdAt!: Date;

  /**
   * Fecha y hora de la última modificación del registro.
   */
  @ApiProperty({
    description: 'Fecha y hora de la última modificación del registro.',
    example: '2026-07-30T13:45:00.000Z',
    type: String,
    format: 'date-time',
    readOnly: true,
  })
  @UpdateDateColumn({
    type: 'timestamp',
  })
  updatedAt!: Date;
}
