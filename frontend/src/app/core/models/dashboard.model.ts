// Representa la información general devuelta por el Dashboard.
export interface DashboardResponse {
  from: string | null;
  to: string | null;
  calculationCount: number;
  totalCollectionAmount: number;
  totalCommissionAmount: number;
  bankCommissionAmount: number;
  clientCommissionAmount: number;
  ownCommissionAmount: number;
  averageCollectionAmount: number;
  topGroup: TopGroup | null;
  topBank: TopBank | null;
}

// Representa al grupo con mayor importe recaudado.
export interface TopGroup {
  id: number;
  name: string;
  totalCollectionAmount: number;
}

// Representa al banco utilizado en más liquidaciones.
export interface TopBank {
  id: number;
  name: string;
  calculationCount: number;
}

// Representa los filtros opcionales enviados al Dashboard.
export interface DashboardFilters {
  from?: string;
  to?: string;
}