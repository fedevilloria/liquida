import { CommissionCalculation } from '../entities/commission-calculation.entity';

/**
 * DTO utilizado para exponer una liquidación mediante la API.
 *
 * Evita devolver las entidades completas de Group y Bank,
 * ofreciendo una respuesta más simple y estable para el frontend.
 */
export class CommissionCalculationResponseDto {
  id!: number;

  groupId!: number;

  groupName!: string;

  bankId!: number;

  bankName!: string;

  collectionAmount!: number;

  totalCommissionPercentage!: number;

  bankCommissionPercentage!: number;

  clientCommissionPercentage!: number | null;

  ownCommissionPercentage!: number;

  totalCommissionAmount!: number;

  bankCommissionAmount!: number;

  clientCommissionAmount!: number | null;

  ownCommissionAmount!: number;

  calculationDateTime!: Date;

  notes!: string | null;

  createdAt!: Date;

  /**
   * Convierte una entidad CommissionCalculation
   * en una respuesta simplificada para la API.
   */
  static fromEntity(
    calculation: CommissionCalculation,
  ): CommissionCalculationResponseDto {
    const response = new CommissionCalculationResponseDto();

    response.id = calculation.id;

    response.groupId = calculation.group.id;
    response.groupName = calculation.group.name;

    response.bankId = calculation.bank.id;
    response.bankName = calculation.bank.name;

    response.collectionAmount = calculation.collectionAmount;

    response.totalCommissionPercentage =
      calculation.totalCommissionPercentage;

    response.bankCommissionPercentage =
      calculation.bankCommissionPercentage;

    response.clientCommissionPercentage =
      calculation.clientCommissionPercentage;

    response.ownCommissionPercentage =
      calculation.ownCommissionPercentage;

    response.totalCommissionAmount =
      calculation.totalCommissionAmount;

    response.bankCommissionAmount =
      calculation.bankCommissionAmount;

    response.clientCommissionAmount =
      calculation.clientCommissionAmount;

    response.ownCommissionAmount =
      calculation.ownCommissionAmount;

    response.calculationDateTime =
      calculation.calculationDateTime;

    response.notes = calculation.notes;

    response.createdAt = calculation.createdAt;

    return response;
  }
}