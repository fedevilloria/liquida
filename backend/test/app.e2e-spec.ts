import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import type { Server } from 'node:http';
import { BanksController } from '../src/banks/banks.controller';
import { BanksService } from '../src/banks/banks.service';

import { CommissionCalculationsController } from '../src/commission-calculations/commission-calculations.controller';
import { CommissionCalculationsService } from '../src/commission-calculations/commission-calculations.service';

import { GroupsController } from '../src/groups/groups.controller';
import { GroupsService } from '../src/groups/groups.service';

describe('API (e2e)', () => {
  let app: INestApplication;
  let httpServer: Server;

  /**
   * Simula las respuestas del servicio de grupos.
   *
   * Estos mocks permiten probar las rutas HTTP sin acceder
   * a una base de datos PostgreSQL real.
   */
  const groupsServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findAllActive: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    restore: jest.fn(),
  };

  /**
   * Simula las respuestas del servicio de bancos.
   */
  const banksServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findAllActive: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    restore: jest.fn(),
  };

  /**
   * Simula las respuestas del servicio de liquidaciones.
   */
  const commissionCalculationsServiceMock = {
    registerCalculation: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    getDashboard: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [
        GroupsController,
        BanksController,
        CommissionCalculationsController,
      ],
      providers: [
        {
          provide: GroupsService,
          useValue: groupsServiceMock,
        },
        {
          provide: BanksService,
          useValue: banksServiceMock,
        },
        {
          provide: CommissionCalculationsService,
          useValue: commissionCalculationsServiceMock,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    /**
     * Utiliza la misma configuración de validación
     * que la aplicación real.
     */
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    httpServer = app.getHttpServer() as Server;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Groups', () => {
    it('GET /groups debe devolver todos los grupos', async () => {
      const groups = [
        {
          id: 1,
          name: 'Grupo Norte',
          active: true,
          createdAt: '2026-07-30T10:00:00.000Z',
          updatedAt: '2026-07-30T10:00:00.000Z',
        },
      ];

      groupsServiceMock.findAll.mockResolvedValue(groups);

      await request(httpServer).get('/groups').expect(200).expect(groups);

      expect(groupsServiceMock.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('Banks', () => {
    it('GET /banks debe devolver todos los bancos', async () => {
      const banks = [
        {
          id: 1,
          name: 'Banco Macro',
          commissionPercentage: 0.8,
          active: true,
          createdAt: '2026-07-30T10:00:00.000Z',
          updatedAt: '2026-07-30T10:00:00.000Z',
        },
      ];

      banksServiceMock.findAll.mockResolvedValue(banks);

      await request(httpServer).get('/banks').expect(200).expect(banks);

      expect(banksServiceMock.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('Commission calculations', () => {
    it('GET /commission-calculations debe devolver el historial paginado', async () => {
      const response = {
        data: [
          {
            id: 1,

            groupId: 1,
            groupName: 'Grupo Norte',

            bankId: 1,
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

            calculationDateTime: '2026-07-30T18:00:00.000Z',

            notes: 'Liquidación correspondiente al cierre de julio.',

            createdAt: '2026-07-30T18:15:00.000Z',
          },
        ],

        pagination: {
          page: 1,
          limit: 10,
          totalItems: 1,
          totalPages: 1,
          hasPreviousPage: false,
          hasNextPage: false,
        },
      };

      commissionCalculationsServiceMock.findAll.mockResolvedValue(response);

      await request(httpServer)
        .get('/commission-calculations')
        .expect(200)
        .expect(response);

      expect(commissionCalculationsServiceMock.findAll).toHaveBeenCalledTimes(
        1,
      );

      expect(commissionCalculationsServiceMock.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 10,
        }),
      );
    });

    it('GET /commission-calculations/dashboard debe devolver las estadísticas', async () => {
      const response = {
        from: null,
        to: null,

        calculationCount: 1,

        totalCollectionAmount: 2500000,
        totalCommissionAmount: 62500,

        bankCommissionAmount: 20000,
        clientCommissionAmount: 25000,
        ownCommissionAmount: 17500,

        averageCollectionAmount: 2500000,

        topGroup: {
          id: 1,
          name: 'Grupo Norte',
          totalCollectionAmount: 2500000,
        },

        topBank: {
          id: 1,
          name: 'Banco Macro',
          calculationCount: 1,
        },
      };

      commissionCalculationsServiceMock.getDashboard.mockResolvedValue(
        response,
      );

      await request(httpServer)
        .get('/commission-calculations/dashboard')
        .expect(200)
        .expect(response);

      expect(
        commissionCalculationsServiceMock.getDashboard,
      ).toHaveBeenCalledTimes(1);
    });
  });

  describe('Validation', () => {
    it('GET /commission-calculations debe rechazar una página inválida', async () => {
      await request(httpServer)
        .get('/commission-calculations?page=0')
        .expect(400);

      expect(commissionCalculationsServiceMock.findAll).not.toHaveBeenCalled();
    });

    it('GET /commission-calculations debe rechazar un campo desconocido', async () => {
      await request(httpServer)
        .get('/commission-calculations?unknownField=value')
        .expect(400);

      expect(commissionCalculationsServiceMock.findAll).not.toHaveBeenCalled();
    });
  });
});
