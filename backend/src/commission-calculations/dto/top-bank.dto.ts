/**
 * Representa al banco utilizado en la mayor cantidad
 * de liquidaciones dentro del período consultado.
 */
export class TopBankDto {
  id!: number;

  name!: string;

  calculationCount!: number;
}