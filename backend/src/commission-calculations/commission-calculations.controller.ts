import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';

import { CommissionCalculationResponseDto } from './dto/commission-calculation-response.dto';
import { RegisterCommissionCalculationDto } from './dto/register-commission-calculation.dto';
import { CommissionCalculationsService } from './commission-calculations.service';
import { FindCommissionCalculationsDto } from './dto/find-commission-calculations.dto';
import { DashboardFiltersDto } from './dto/dashboard-filters.dto';
import { CommissionDashboardResponseDto } from './dto/commission-dashboard-response.dto';
import { PaginatedCommissionCalculationResponseDto } from './dto/paginated-commission-calculation-response.dto';

@Controller('commission-calculations')
export class CommissionCalculationsController {
  /**
   * Inyecta el servicio que contiene la lógica
   * para registrar y consultar liquidaciones.
   */
  constructor(
    private readonly commissionCalculationsService:
      CommissionCalculationsService,
  ) {}

  /**
   * Registra una nueva liquidación individual
   * y devuelve una respuesta simplificada.
   *
   * POST /commission-calculations
   */
  @Post()
  async registerCalculation(
    @Body() dto: RegisterCommissionCalculationDto,
  ): Promise<CommissionCalculationResponseDto> {
    return this.commissionCalculationsService.registerCalculation(
      dto,
    );
  }

  /**
   * Obtiene el historial paginado de liquidaciones.
   *
   * Los parámetros de consulta permiten:
   * - Filtrar por grupo, banco y período.
   * - Seleccionar la página y el límite.
   * - Configurar el campo y la dirección de ordenamiento.
   *
   * GET /commission-calculations
   * GET /commission-calculations?groupId=1
   * GET /commission-calculations?bankId=1
   * GET /commission-calculations?from=2026-07-01&to=2026-07-31
   * GET /commission-calculations?page=1&limit=10
   * GET /commission-calculations?sortBy=collectionAmount&sortOrder=ASC
   */
  @Get()
  async findAll(
    @Query() filters: FindCommissionCalculationsDto,
  ): Promise<PaginatedCommissionCalculationResponseDto> {
    return this.commissionCalculationsService.findAll(filters);
  }

  /**
  * Obtiene las estadísticas generales del dashboard.
  *
  * Las fechas son opcionales y permiten limitar las estadísticas
  * a un período determinado.
  *
  * GET /commission-calculations/dashboard
  * GET /commission-calculations/dashboard?from=2026-07-01
  * GET /commission-calculations/dashboard?to=2026-07-31
  * GET /commission-calculations/dashboard?from=2026-07-01&to=2026-07-31
  */
  @Get('dashboard')
  async getDashboard(
    @Query() filters: DashboardFiltersDto,
  ): Promise<CommissionDashboardResponseDto> {
    return this.commissionCalculationsService.getDashboard(filters);
  }

  /**
   * Obtiene una liquidación mediante su identificador.
   *
   * GET /commission-calculations/:id
   */
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CommissionCalculationResponseDto> {
    return this.commissionCalculationsService.findOne(id);
  }
}