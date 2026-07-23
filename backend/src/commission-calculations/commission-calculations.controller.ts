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
    @Body()
    registerDto: RegisterCommissionCalculationDto,
  ): Promise<CommissionCalculationResponseDto> {
    const calculation =
      await this.commissionCalculationsService.registerCalculation(
        registerDto,
      );

    return CommissionCalculationResponseDto.fromEntity(calculation);
  }

  /**
   * Obtiene todas las liquidaciones registradas.
   *
   * GET /commission-calculations
   */
  @Get()
  /**
  * Obtiene el historial de liquidaciones.
  *
  * Los parámetros de consulta permiten filtrar por grupo,
  * banco y período sin crear endpoints separados.
  *
  * GET /commission-calculations
  * GET /commission-calculations?groupId=1
  * GET /commission-calculations?bankId=1
  * GET /commission-calculations?from=2026-07-01&to=2026-07-31
  */
  @Get()
  async findAll(
    @Query() filters: FindCommissionCalculationsDto,
  ): Promise<CommissionCalculationResponseDto[]> {
    const calculations =
      await this.commissionCalculationsService.findAll(filters);

    return calculations.map((calculation) =>
      CommissionCalculationResponseDto.fromEntity(calculation),
    );
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
    const calculation =
      await this.commissionCalculationsService.findOne(id);

    return CommissionCalculationResponseDto.fromEntity(calculation);
  }
}