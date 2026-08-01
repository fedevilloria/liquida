import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';

import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { CommissionCalculationsService } from './commission-calculations.service';

import { CommissionCalculationResponseDto } from './dto/commission-calculation-response.dto';
import { CommissionDashboardResponseDto } from './dto/commission-dashboard-response.dto';
import { DashboardFiltersDto } from './dto/dashboard-filters.dto';

import {
  CommissionCalculationSortBy,
  FindCommissionCalculationsDto,
  SortOrder,
} from './dto/find-commission-calculations.dto';

import { PaginatedCommissionCalculationResponseDto } from './dto/paginated-commission-calculation-response.dto';
import { RegisterCommissionCalculationDto } from './dto/register-commission-calculation.dto';

@ApiTags('Commission Calculations')
@Controller('commission-calculations')
export class CommissionCalculationsController {
  /**
   * Inyecta el servicio que contiene la lógica
   * para registrar y consultar liquidaciones.
   */
  constructor(
    private readonly commissionCalculationsService: CommissionCalculationsService,
  ) {}

  /**
   * Registra una nueva liquidación individual
   * y devuelve los resultados calculados.
   *
   * POST /commission-calculations
   */
  @ApiOperation({
    summary: 'Registrar una liquidación',
    description:
      'Registra una nueva liquidación y calcula automáticamente los porcentajes e importes correspondientes al banco, al cliente y a la organización.',
  })
  @ApiCreatedResponse({
    description: 'La liquidación fue registrada correctamente.',
    type: CommissionCalculationResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      'Los datos enviados no cumplen las validaciones, el grupo o banco está inactivo, o la distribución de porcentajes es inválida.',
  })
  @ApiNotFoundResponse({
    description: 'No se encontró el grupo o el banco indicado.',
  })
  @Post()
  async registerCalculation(
    @Body() dto: RegisterCommissionCalculationDto,
  ): Promise<CommissionCalculationResponseDto> {
    return this.commissionCalculationsService.registerCalculation(dto);
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
  @ApiOperation({
    summary: 'Consultar las estadísticas del dashboard',
    description:
      'Devuelve estadísticas generales de las liquidaciones. Puede limitarse el cálculo a un período mediante las fechas from y to.',
  })
  @ApiQuery({
    name: 'from',
    required: false,
    description:
      'Fecha inicial del período. Incluye las liquidaciones desde el comienzo del día indicado.',
    example: '2026-07-01',
    schema: {
      type: 'string',
      format: 'date',
    },
  })
  @ApiQuery({
    name: 'to',
    required: false,
    description:
      'Fecha final del período. Incluye las liquidaciones hasta el final del día indicado.',
    example: '2026-07-31',
    schema: {
      type: 'string',
      format: 'date',
    },
  })
  @ApiOkResponse({
    description: 'Estadísticas del dashboard obtenidas correctamente.',
    type: CommissionDashboardResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      'Las fechas tienen un formato inválido o la fecha inicial es posterior a la fecha final.',
    schema: {
      example: {
        statusCode: 400,
        message: 'La fecha inicial no puede ser posterior a la fecha final.',
        error: 'Bad Request',
      },
    },
  })
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
  @ApiOperation({
    summary: 'Consultar una liquidación por su identificador',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador numérico de la liquidación.',
    example: 1,
    type: Number,
  })
  @ApiOkResponse({
    description: 'Liquidación encontrada correctamente.',
    type: CommissionCalculationResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'El identificador recibido no es un número entero válido.',
  })
  @ApiNotFoundResponse({
    description:
      'No se encontró una liquidación con el identificador indicado.',
  })
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CommissionCalculationResponseDto> {
    return this.commissionCalculationsService.findOne(id);
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
  @ApiOperation({
    summary: 'Consultar el historial de liquidaciones',
    description:
      'Devuelve el historial paginado de liquidaciones. Permite aplicar filtros por grupo, banco y período, además de configurar la paginación y el ordenamiento.',
  })
  @ApiQuery({
    name: 'groupId',
    required: false,
    description: 'Identificador del grupo utilizado para filtrar el historial.',
    example: 1,
    type: Number,
  })
  @ApiQuery({
    name: 'bankId',
    required: false,
    description: 'Identificador del banco utilizado para filtrar el historial.',
    example: 2,
    type: Number,
  })
  @ApiQuery({
    name: 'from',
    required: false,
    description:
      'Fecha inicial del período. Incluye las liquidaciones desde el comienzo del día indicado.',
    example: '2026-07-01',
    type: String,
  })
  @ApiQuery({
    name: 'to',
    required: false,
    description:
      'Fecha final del período. Incluye las liquidaciones hasta el final del día indicado.',
    example: '2026-07-31',
    type: String,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Número de página solicitada.',
    example: 1,
    type: Number,
    schema: {
      default: 1,
      minimum: 1,
    },
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Cantidad máxima de liquidaciones devueltas por página.',
    example: 10,
    type: Number,
    schema: {
      default: 10,
      minimum: 1,
      maximum: 100,
    },
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    description: 'Campo utilizado para ordenar el historial.',
    enum: CommissionCalculationSortBy,
    example: CommissionCalculationSortBy.CALCULATION_DATE_TIME,
    schema: {
      default: CommissionCalculationSortBy.CALCULATION_DATE_TIME,
    },
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    description: 'Dirección utilizada para ordenar los resultados.',
    enum: SortOrder,
    example: SortOrder.DESC,
    schema: {
      default: SortOrder.DESC,
    },
  })
  @ApiOkResponse({
    description: 'Historial paginado obtenido correctamente.',
    type: PaginatedCommissionCalculationResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      'Alguno de los filtros, parámetros de paginación u ordenamiento es inválido, o la fecha inicial es posterior a la fecha final.',
  })
  @Get()
  async findAll(
    @Query() filters: FindCommissionCalculationsDto,
  ): Promise<PaginatedCommissionCalculationResponseDto> {
    return this.commissionCalculationsService.findAll(filters);
  }
}
