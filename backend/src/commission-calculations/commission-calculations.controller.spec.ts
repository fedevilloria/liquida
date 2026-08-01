import { Test, TestingModule } from '@nestjs/testing';

import { CommissionCalculationsController } from './commission-calculations.controller';
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

/**
 * Crea una respuesta válida de liquidación para reutilizarla
 * en las distintas pruebas del controlador.
 */
const createCalculationResponse = (
  overrides: Partial<CommissionCalculationResponseDto> = {},
): CommissionCalculationResponseDto => ({
  id: 1,

  groupId: 1,
  groupName: 'Grupo Norte',

  bankId: 2,
  bankName: 'Banco Macro',

  collectionAmount: 2500000,

  totalCommissionPercentage: 2.5,
  bankCommissionPercentage: 0.8,
  clientCommissionPercentage: 1,
  ownCommissionPercentage: 0.7,

  totalCommissionAmount: 62500,
  bankCommissionAmount: 20000,
  clientCommissionAmount: 25000,
  ownCommissionAmount: 17500,

  calculationDateTime: new Date('2026-07-30T18:00:00.000Z'),

  notes: 'Liquidación correspondiente al cierre de julio.',

  createdAt: new Date('2026-07-30T18:15:00.000Z'),

  ...overrides,
});

describe('CommissionCalculationsController', () => {
  let controller: CommissionCalculationsController;

  /**
   * Mock del servicio de liquidaciones.
   *
   * Estas pruebas comprueban que el controlador
   * delegue correctamente cada operación,
   * sin ejecutar reglas de negocio ni consultas reales.
   */
  const commissionCalculationsServiceMock = {
    registerCalculation: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    getDashboard: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommissionCalculationsController],
      providers: [
        {
          provide: CommissionCalculationsService,
          useValue: commissionCalculationsServiceMock,
        },
      ],
    }).compile();

    controller = module.get<CommissionCalculationsController>(
      CommissionCalculationsController,
    );
  });

  it('debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('registerCalculation', () => {
    it('debe delegar el registro de una liquidación en el servicio', async () => {
      const dto: RegisterCommissionCalculationDto = {
        groupId: 1,
        bankId: 2,
        collectionAmount: 2500000,
        totalCommissionPercentage: 2.5,
        clientCommissionPercentage: 1,
        calculationDateTime: new Date('2026-07-30T18:00:00.000Z'),
        notes: 'Liquidación correspondiente al cierre de julio.',
      };

      const registeredCalculation = createCalculationResponse();

      commissionCalculationsServiceMock.registerCalculation.mockResolvedValue(
        registeredCalculation,
      );

      const result = await controller.registerCalculation(dto);

      expect(
        commissionCalculationsServiceMock.registerCalculation,
      ).toHaveBeenCalledTimes(1);

      expect(
        commissionCalculationsServiceMock.registerCalculation,
      ).toHaveBeenCalledWith(dto);

      expect(result).toEqual(registeredCalculation);
    });
  });

  describe('findAll', () => {
    it('debe delegar la consulta paginada del historial en el servicio', async () => {
      const filters: FindCommissionCalculationsDto = {
        groupId: 1,
        bankId: 2,
        from: '2026-07-01',
        to: '2026-07-31',
        page: 1,
        limit: 10,
        sortBy: CommissionCalculationSortBy.CALCULATION_DATE_TIME,
        sortOrder: SortOrder.DESC,
      };

      const paginatedResponse: PaginatedCommissionCalculationResponseDto = {
        data: [createCalculationResponse()],
        pagination: {
          page: 1,
          limit: 10,
          totalItems: 1,
          totalPages: 1,
          hasPreviousPage: false,
          hasNextPage: false,
        },
      };

      commissionCalculationsServiceMock.findAll.mockResolvedValue(
        paginatedResponse,
      );

      const result = await controller.findAll(filters);

      expect(commissionCalculationsServiceMock.findAll).toHaveBeenCalledTimes(
        1,
      );

      expect(commissionCalculationsServiceMock.findAll).toHaveBeenCalledWith(
        filters,
      );

      expect(result).toEqual(paginatedResponse);
    });
  });

  describe('findOne', () => {
    it('debe delegar la búsqueda de una liquidación por ID en el servicio', async () => {
      const calculation = createCalculationResponse();

      commissionCalculationsServiceMock.findOne.mockResolvedValue(calculation);

      const result = await controller.findOne(1);

      expect(commissionCalculationsServiceMock.findOne).toHaveBeenCalledTimes(
        1,
      );

      expect(commissionCalculationsServiceMock.findOne).toHaveBeenCalledWith(1);

      expect(result).toEqual(calculation);
    });
  });

  describe('getDashboard', () => {
    it('debe delegar la consulta del dashboard en el servicio', async () => {
      const filters: DashboardFiltersDto = {
        from: '2026-07-01',
        to: '2026-07-31',
      };

      const dashboardResponse: CommissionDashboardResponseDto = {
        from: '2026-07-01',
        to: '2026-07-31',

        calculationCount: 15,

        totalCollectionAmount: 25000000,
        totalCommissionAmount: 625000,

        bankCommissionAmount: 200000,
        clientCommissionAmount: 250000,
        ownCommissionAmount: 175000,

        averageCollectionAmount: 1666666.67,

        topGroup: {
          id: 1,
          name: 'Grupo Norte',
          totalCollectionAmount: 12000000,
        },

        topBank: {
          id: 2,
          name: 'Banco Macro',
          calculationCount: 9,
        },
      };

      commissionCalculationsServiceMock.getDashboard.mockResolvedValue(
        dashboardResponse,
      );

      const result = await controller.getDashboard(filters);

      expect(
        commissionCalculationsServiceMock.getDashboard,
      ).toHaveBeenCalledTimes(1);

      expect(
        commissionCalculationsServiceMock.getDashboard,
      ).toHaveBeenCalledWith(filters);

      expect(result).toEqual(dashboardResponse);
    });

    it('debe permitir consultar el dashboard sin filtros', async () => {
      const filters: DashboardFiltersDto = {};

      const dashboardResponse: CommissionDashboardResponseDto = {
        from: null,
        to: null,

        calculationCount: 0,

        totalCollectionAmount: 0,
        totalCommissionAmount: 0,

        bankCommissionAmount: 0,
        clientCommissionAmount: 0,
        ownCommissionAmount: 0,

        averageCollectionAmount: 0,

        topGroup: null,
        topBank: null,
      };

      commissionCalculationsServiceMock.getDashboard.mockResolvedValue(
        dashboardResponse,
      );

      const result = await controller.getDashboard(filters);

      expect(
        commissionCalculationsServiceMock.getDashboard,
      ).toHaveBeenCalledTimes(1);

      expect(
        commissionCalculationsServiceMock.getDashboard,
      ).toHaveBeenCalledWith(filters);

      expect(result).toEqual(dashboardResponse);
    });
  });
});
