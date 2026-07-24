import { TopBankDto } from './top-bank.dto';
import { TopGroupDto } from './top-group.dto';

/**
 * Representa las estadísticas generales
 * del dashboard de liquidaciones.
 */
export class CommissionDashboardResponseDto {
  from!: string | null;

  to!: string | null;

  calculationCount!: number;

  totalCollectionAmount!: number;

  totalCommissionAmount!: number;

  bankCommissionAmount!: number;

  clientCommissionAmount!: number;

  ownCommissionAmount!: number;

  averageCollectionAmount!: number;

  topGroup!: TopGroupDto | null;

  topBank!: TopBankDto | null;
}