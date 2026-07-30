import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { BanksService } from '../banks/banks.service';
import { GroupsService } from '../groups/groups.service';
import { CommissionCalculationsService } from './commission-calculations.service';
import { RegisterCommissionCalculationDto } from './dto/register-commission-calculation.dto';
import { CommissionCalculation } from './entities/commission-calculation.entity';

/**
 * Estructura mínima de un grupo necesaria para estas pruebas.
 */
interface GroupFixture {
  id: number;
  name: string;
  active: boolean;
}

/**
 * Estructura mínima de un banco necesaria para estas pruebas.
 */
interface BankFixture {
  id: number;
  name: string;
  active: boolean;
  commissionPercentage: number | string;
}

/**
 * Crea un DTO válido con valores predeterminados.
 *
 * Cada prueba puede reemplazar únicamente los campos
 * necesarios mediante el parámetro overrides.
 */
const createRegisterDto = (
  overrides: Partial<RegisterCommissionCalculationDto> = {},
): RegisterCommissionCalculationDto => ({
  groupId: 1,
  bankId: 1,
  collectionAmount: 2500000,
  totalCommissionPercentage: 2.5,
  clientCommissionPercentage: 0.2,
  calculationDateTime: new Date('2026-07-25T10:30:00'),
  notes: 'Liquidación de prueba',
  ...overrides,
});

/**
 * Crea un grupo activo de prueba.
 */
const createGroup = (
  overrides: Partial<GroupFixture> = {},
): GroupFixture => ({
  id: 1,
  name: 'Silvina C',
  active: true,
  ...overrides,
});

/**
 * Crea un banco activo con una comisión del 0,3%.
 */
const createBank = (
  overrides: Partial<BankFixture> = {},
): BankFixture => ({
  id: 1,
  name: 'Copter',
  active: true,
  commissionPercentage: 0.3,
  ...overrides,
});

/**
 * Crea una liquidación simulada.
 *
 * Se utiliza para representar la entidad construida por create()
 * y posteriormente persistida mediante save().
 */
const createCalculation = (
  overrides: Partial<CommissionCalculation> = {},
): CommissionCalculation =>
  ({
    id: 9,
    collectionAmount: 2500000,
    totalCommissionPercentage: 2.5,
    bankCommissionPercentage: 0.3,
    clientCommissionPercentage: 0.2,
    ownCommissionPercentage: 2,
    totalCommissionAmount: 62500,
    bankCommissionAmount: 7500,
    clientCommissionAmount: 5000,
    ownCommissionAmount: 50000,
    calculationDateTime: new Date('2026-07-25T10:30:00'),
    notes: 'Liquidación de prueba',
    group: createGroup(),
    bank: createBank(),
    createdAt: new Date('2026-07-25T13:32:37.789Z'),
    ...overrides,
  }) as CommissionCalculation;

describe('CommissionCalculationsService', () => {
  let service: CommissionCalculationsService;

  /**
   * Mock reutilizable del QueryBuilder de TypeORM.
   *
   * Cada método de construcción devuelve el mismo objeto para
   * permitir el encadenamiento de llamadas.
   */
  const queryBuilderMock = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),

    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),

    andWhere: jest.fn().mockReturnThis(),

    groupBy: jest.fn().mockReturnThis(),
    addGroupBy: jest.fn().mockReturnThis(),

    orderBy: jest.fn().mockReturnThis(),

    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),

    getManyAndCount: jest.fn(),
    getRawOne: jest.fn(),
  };

  /**
   * Mock del repositorio de liquidaciones.
   *
   * Reemplaza las operaciones reales de TypeORM para evitar
   * conexiones a PostgreSQL durante las pruebas unitarias.
   */
  const commissionCalculationsRepositoryMock = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest
      .fn()
      .mockReturnValue(queryBuilderMock),
  };

  /**
   * Mock del servicio de grupos.
   */
  const groupsServiceMock = {
    findOne: jest.fn(),
  };

  /**
   * Mock del servicio de bancos.
   */
  const banksServiceMock = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    /**
     * Elimina llamadas y respuestas configuradas
     * por cualquier prueba anterior.
     */
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommissionCalculationsService,
        {
          provide: getRepositoryToken(CommissionCalculation),
          useValue: commissionCalculationsRepositoryMock,
        },
        {
          provide: GroupsService,
          useValue: groupsServiceMock,
        },
        {
          provide: BanksService,
          useValue: banksServiceMock,
        },
      ],
    }).compile();

    service = module.get<CommissionCalculationsService>(
      CommissionCalculationsService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('registerCalculation', () => {
    it('debe registrar correctamente una liquidación con comisión del cliente', async () => {
      const registerDto = createRegisterDto();
      const group = createGroup();

      /**
       * También comprobamos que el servicio convierta correctamente
       * el porcentaje cuando el banco lo devuelve como texto.
       */
      const bank = createBank({
        commissionPercentage: '0.3',
      });

      const calculation = createCalculation({
        calculationDateTime: registerDto.calculationDateTime,
        notes: registerDto.notes ?? null,
        group: group as CommissionCalculation['group'],
        bank: bank as CommissionCalculation['bank'],
      });

      groupsServiceMock.findOne.mockResolvedValue(group);
      banksServiceMock.findOne.mockResolvedValue(bank);

      commissionCalculationsRepositoryMock.create.mockReturnValue(
        calculation,
      );

      commissionCalculationsRepositoryMock.save.mockResolvedValue(
        calculation,
      );

      const result = await service.registerCalculation(registerDto);

      expect(groupsServiceMock.findOne).toHaveBeenCalledWith(
        registerDto.groupId,
      );

      expect(banksServiceMock.findOne).toHaveBeenCalledWith(
        registerDto.bankId,
      );

      expect(
        commissionCalculationsRepositoryMock.create,
      ).toHaveBeenCalledWith({
        collectionAmount: 2500000,
        totalCommissionPercentage: 2.5,
        bankCommissionPercentage: 0.3,
        clientCommissionPercentage: 0.2,
        ownCommissionPercentage: 2,
        totalCommissionAmount: 62500,
        bankCommissionAmount: 7500,
        clientCommissionAmount: 5000,
        ownCommissionAmount: 50000,
        calculationDateTime: registerDto.calculationDateTime,
        notes: 'Liquidación de prueba',
        group,
        bank,
      });

      expect(
        commissionCalculationsRepositoryMock.save,
      ).toHaveBeenCalledWith(calculation);

      expect(result).toEqual({
        id: 9,
        groupId: 1,
        groupName: 'Silvina C',
        bankId: 1,
        bankName: 'Copter',
        collectionAmount: 2500000,
        totalCommissionPercentage: 2.5,
        bankCommissionPercentage: 0.3,
        clientCommissionPercentage: 0.2,
        ownCommissionPercentage: 2,
        totalCommissionAmount: 62500,
        bankCommissionAmount: 7500,
        clientCommissionAmount: 5000,
        ownCommissionAmount: 50000,
        calculationDateTime: registerDto.calculationDateTime,
        notes: 'Liquidación de prueba',
        createdAt: calculation.createdAt,
      });
    });

    it('debe lanzar una excepción cuando el grupo está inactivo', async () => {
      const registerDto = createRegisterDto();

      const inactiveGroup = createGroup({
        active: false,
      });

      groupsServiceMock.findOne.mockResolvedValue(inactiveGroup);

      await expect(
        service.registerCalculation(registerDto),
      ).rejects.toThrow(
        'El grupo "Silvina C" se encuentra inactivo.',
      );

      expect(groupsServiceMock.findOne).toHaveBeenCalledWith(1);
      expect(banksServiceMock.findOne).not.toHaveBeenCalled();

      expect(
        commissionCalculationsRepositoryMock.create,
      ).not.toHaveBeenCalled();

      expect(
        commissionCalculationsRepositoryMock.save,
      ).not.toHaveBeenCalled();
    });

    it('debe lanzar una excepción cuando el banco está inactivo', async () => {
      const registerDto = createRegisterDto();

      const group = createGroup();

      const inactiveBank = createBank({
        active: false,
      });

      groupsServiceMock.findOne.mockResolvedValue(group);
      banksServiceMock.findOne.mockResolvedValue(inactiveBank);

      await expect(
        service.registerCalculation(registerDto),
      ).rejects.toThrow(
        'El banco "Copter" se encuentra inactivo.',
      );

      expect(groupsServiceMock.findOne).toHaveBeenCalledWith(1);
      expect(banksServiceMock.findOne).toHaveBeenCalledWith(1);

      expect(
        commissionCalculationsRepositoryMock.create,
      ).not.toHaveBeenCalled();

      expect(
        commissionCalculationsRepositoryMock.save,
      ).not.toHaveBeenCalled();
    });

    it('debe lanzar una excepción cuando la suma de las comisiones supera la comisión total', async () => {
      const registerDto = createRegisterDto({
        clientCommissionPercentage: 1,
      });

      const group = createGroup();

      /**
       * Banco 2% + cliente 1% supera
       * la comisión total del 2,5%.
       */
      const bank = createBank({
        commissionPercentage: 2,
      });

      groupsServiceMock.findOne.mockResolvedValue(group);
      banksServiceMock.findOne.mockResolvedValue(bank);

      await expect(
        service.registerCalculation(registerDto),
      ).rejects.toThrow(
        'La suma de la comisión del banco y la comisión del cliente no puede superar la comisión total.',
      );

      expect(
        commissionCalculationsRepositoryMock.create,
      ).not.toHaveBeenCalled();

      expect(
        commissionCalculationsRepositoryMock.save,
      ).not.toHaveBeenCalled();
    });

    it('debe registrar correctamente una liquidación sin comisión del cliente', async () => {
      const registerDto = createRegisterDto({
        collectionAmount: 1800000,
        clientCommissionPercentage: undefined,
        calculationDateTime: new Date('2026-07-25T14:00:00'),
        notes: 'Sin comisión del cliente',
      });

      const group = createGroup();
      const bank = createBank();

      const calculation = createCalculation({
        id: 10,
        collectionAmount: 1800000,
        clientCommissionPercentage: null,
        ownCommissionPercentage: 2.2,
        totalCommissionAmount: 45000,
        bankCommissionAmount: 5400,
        clientCommissionAmount: null,
        ownCommissionAmount: 39600,
        calculationDateTime: registerDto.calculationDateTime,
        notes: registerDto.notes ?? null,
        group: group as CommissionCalculation['group'],
        bank: bank as CommissionCalculation['bank'],
        createdAt: new Date(),
      });

      groupsServiceMock.findOne.mockResolvedValue(group);
      banksServiceMock.findOne.mockResolvedValue(bank);

      commissionCalculationsRepositoryMock.create.mockReturnValue(
        calculation,
      );

      commissionCalculationsRepositoryMock.save.mockResolvedValue(
        calculation,
      );

      const result = await service.registerCalculation(registerDto);

      expect(
        commissionCalculationsRepositoryMock.create,
      ).toHaveBeenCalledWith({
        collectionAmount: 1800000,
        totalCommissionPercentage: 2.5,
        bankCommissionPercentage: 0.3,
        clientCommissionPercentage: null,
        ownCommissionPercentage: 2.2,
        totalCommissionAmount: 45000,
        bankCommissionAmount: 5400,
        clientCommissionAmount: null,
        ownCommissionAmount: 39600,
        calculationDateTime: registerDto.calculationDateTime,
        notes: 'Sin comisión del cliente',
        group,
        bank,
      });

      expect(
        commissionCalculationsRepositoryMock.save,
      ).toHaveBeenCalledWith(calculation);

      expect(result.clientCommissionPercentage).toBeNull();
      expect(result.clientCommissionAmount).toBeNull();
      expect(result.ownCommissionPercentage).toBe(2.2);
    });

    it('debe propagar la excepción cuando el grupo no existe', async () => {
      const registerDto = createRegisterDto({
        groupId: 999,
      });

      groupsServiceMock.findOne.mockRejectedValue(
        new Error('Grupo no encontrado'),
      );

      await expect(
        service.registerCalculation(registerDto),
      ).rejects.toThrow('Grupo no encontrado');

      expect(groupsServiceMock.findOne).toHaveBeenCalledWith(999);
      expect(banksServiceMock.findOne).not.toHaveBeenCalled();

      expect(
        commissionCalculationsRepositoryMock.create,
      ).not.toHaveBeenCalled();

      expect(
        commissionCalculationsRepositoryMock.save,
      ).not.toHaveBeenCalled();
    });

    it('debe propagar la excepción cuando el banco no existe', async () => {
      const registerDto = createRegisterDto({
        bankId: 999,
      });

      const group = createGroup();

      groupsServiceMock.findOne.mockResolvedValue(group);

      banksServiceMock.findOne.mockRejectedValue(
        new Error('Banco no encontrado'),
      );

      await expect(
        service.registerCalculation(registerDto),
      ).rejects.toThrow('Banco no encontrado');

      expect(groupsServiceMock.findOne).toHaveBeenCalledWith(1);
      expect(banksServiceMock.findOne).toHaveBeenCalledWith(999);

      expect(
        commissionCalculationsRepositoryMock.create,
      ).not.toHaveBeenCalled();

      expect(
        commissionCalculationsRepositoryMock.save,
      ).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('debe devolver una liquidación existente transformada a DTO', async () => {
      const calculation = createCalculation({
        id: 15,
      });

      commissionCalculationsRepositoryMock.findOne.mockResolvedValue(
        calculation,
      );

      const result = await service.findOne(15);

      expect(
        commissionCalculationsRepositoryMock.findOne,
      ).toHaveBeenCalledWith({
        where: {
          id: 15,
        },
        relations: {
          group: true,
          bank: true,
        },
      });

      expect(result).toEqual({
        id: 15,
        groupId: calculation.group.id,
        groupName: calculation.group.name,
        bankId: calculation.bank.id,
        bankName: calculation.bank.name,
        collectionAmount: calculation.collectionAmount,
        totalCommissionPercentage:
          calculation.totalCommissionPercentage,
        bankCommissionPercentage:
          calculation.bankCommissionPercentage,
        clientCommissionPercentage:
          calculation.clientCommissionPercentage,
        ownCommissionPercentage:
          calculation.ownCommissionPercentage,
        totalCommissionAmount:
          calculation.totalCommissionAmount,
        bankCommissionAmount:
          calculation.bankCommissionAmount,
        clientCommissionAmount:
          calculation.clientCommissionAmount,
        ownCommissionAmount:
          calculation.ownCommissionAmount,
        calculationDateTime:
          calculation.calculationDateTime,
        notes: calculation.notes,
        createdAt: calculation.createdAt,
      });
    });

    it('debe lanzar una excepción cuando la liquidación no existe', async () => {
      commissionCalculationsRepositoryMock.findOne.mockResolvedValue(
        null,
      );

      await expect(service.findOne(999)).rejects.toThrow(
        'No se encontró la liquidación con ID 999.',
      );

      expect(
        commissionCalculationsRepositoryMock.findOne,
      ).toHaveBeenCalledWith({
        where: {
          id: 999,
        },
        relations: {
          group: true,
          bank: true,
        },
      });
    });

    describe('findAll', () => {
      it('debe devolver la primera página del historial sin filtros', async () => {
        const calculation = createCalculation();

        queryBuilderMock.getManyAndCount.mockResolvedValue([
          [calculation],
          1,
        ]);

        const result = await service.findAll({
          page: 1,
          limit: 10,
          sortBy: 'calculationDateTime',
          sortOrder: 'DESC',
        });

        expect(
          commissionCalculationsRepositoryMock.createQueryBuilder,
        ).toHaveBeenCalledWith('calculation');

        expect(
          queryBuilderMock.leftJoinAndSelect,
        ).toHaveBeenNthCalledWith(

          1,
          'calculation.group',
          'group',
        );

        expect(
          queryBuilderMock.leftJoinAndSelect,
        ).toHaveBeenNthCalledWith(
          2,
          'calculation.bank',
          'bank',
        );

        expect(queryBuilderMock.orderBy).toHaveBeenCalledWith(
          'calculation.calculationDateTime',
          'DESC',
        );

        expect(queryBuilderMock.skip).toHaveBeenCalledWith(0);

        expect(queryBuilderMock.take).toHaveBeenCalledWith(10);

        expect(result.pagination).toEqual({
          page: 1,
          limit: 10,
          totalItems: 1,
          totalPages: 1,
          hasPreviousPage: false,
          hasNextPage: false,
        });

        expect(result.data).toHaveLength(1);

        expect(result.data[0].id).toBe(calculation.id);
      });

      it('debe aplicar el filtro por grupo', async () => {
        const calculation = createCalculation({
          group: createGroup({
            id: 3,
            name: 'Reca Lauta',
          }) as CommissionCalculation['group'],
        });

        queryBuilderMock.getManyAndCount.mockResolvedValue([
          [calculation],
          1,
        ]);

        const result = await service.findAll({
          groupId: 3,
          page: 1,
          limit: 10,
          sortBy: 'calculationDateTime',
          sortOrder: 'DESC',
        });

        expect(
          commissionCalculationsRepositoryMock.createQueryBuilder,
        ).toHaveBeenCalledWith('calculation');

        expect(queryBuilderMock.andWhere).toHaveBeenCalledWith(
          'group.id = :groupId',
          {
            groupId: 3,
          },
        );

        expect(queryBuilderMock.orderBy).toHaveBeenCalledWith(
          'calculation.calculationDateTime',
          'DESC',
        );

        expect(queryBuilderMock.skip).toHaveBeenCalledWith(0);
        expect(queryBuilderMock.take).toHaveBeenCalledWith(10);

        expect(result.data).toHaveLength(1);
        expect(result.data[0].groupId).toBe(3);
        expect(result.data[0].groupName).toBe('Reca Lauta');

        expect(result.pagination).toEqual({
          page: 1,
          limit: 10,
          totalItems: 1,
          totalPages: 1,
          hasPreviousPage: false,
          hasNextPage: false,
        });
      });

      it('debe aplicar el filtro por banco', async () => {
        const calculation = createCalculation({
          bank: createBank({
            id: 2,
            name: 'Telepagos',
          }) as CommissionCalculation['bank'],
        });

        queryBuilderMock.getManyAndCount.mockResolvedValue([
          [calculation],
          1,
        ]);

        const result = await service.findAll({
          bankId: 2,
          page: 1,
          limit: 10,
          sortBy: 'calculationDateTime',
          sortOrder: 'DESC',
        });

        expect(queryBuilderMock.andWhere).toHaveBeenCalledWith(
          'bank.id = :bankId',
          {
            bankId: 2,
          },
        );

        expect(result.data).toHaveLength(1);

        expect(result.data[0].bankId).toBe(2);
        expect(result.data[0].bankName).toBe('Telepagos');

        expect(result.pagination.totalItems).toBe(1);
      });

      it('debe aplicar simultáneamente los filtros por grupo y banco', async () => {
        const calculation = createCalculation({
          group: createGroup({
            id: 3,
            name: 'Reca Lauta',
          }) as CommissionCalculation['group'],

          bank: createBank({
            id: 2,
            name: 'Telepagos',
          }) as CommissionCalculation['bank'],
        });

        queryBuilderMock.getManyAndCount.mockResolvedValue([
          [calculation],
          1,
        ]);

        const result = await service.findAll({
          groupId: 3,
          bankId: 2,
          page: 1,
          limit: 10,
          sortBy: 'calculationDateTime',
          sortOrder: 'DESC',
        });

        expect(queryBuilderMock.andWhere).toHaveBeenCalledTimes(2);

        expect(queryBuilderMock.andWhere).toHaveBeenNthCalledWith(
          1,
          'group.id = :groupId',
          {
            groupId: 3,
          },
        );

        expect(queryBuilderMock.andWhere).toHaveBeenNthCalledWith(
          2,
          'bank.id = :bankId',
          {
            bankId: 2,
          },
        );

        expect(result.data).toHaveLength(1);
        expect(result.data[0].groupId).toBe(3);
        expect(result.data[0].bankId).toBe(2);
      });

      it('debe lanzar una excepción cuando la fecha inicial es posterior a la fecha final', async () => {
        const filters = {
          from: '2026-07-30',
          to: '2026-07-01',
          page: 1,
          limit: 10,
          sortBy: 'calculationDateTime',
          sortOrder: 'DESC',
        };

        await expect(
          service.findAll(filters),
        ).rejects.toThrow(
          'La fecha inicial no puede ser posterior a la fecha final.',
        );

        /**
         * La consulta no debe llegar a ejecutarse
         * porque el rango de fechas es inválido.
         */
        expect(queryBuilderMock.orderBy).not.toHaveBeenCalled();
        expect(queryBuilderMock.skip).not.toHaveBeenCalled();
        expect(queryBuilderMock.take).not.toHaveBeenCalled();
        expect(
          queryBuilderMock.getManyAndCount,
        ).not.toHaveBeenCalled();
      });

      it('debe aplicar el filtro por rango de fechas', async () => {
        const calculation = createCalculation();

        queryBuilderMock.getManyAndCount.mockResolvedValue([
          [calculation],
          1,
        ]);

        const result = await service.findAll({
          from: '2026-07-01',
          to: '2026-07-31',
          page: 1,
          limit: 10,
          sortBy: 'calculationDateTime',
          sortOrder: 'DESC',
        });

        /**
         * Debe agregarse un filtro para la fecha inicial.
         */
        expect(queryBuilderMock.andWhere).toHaveBeenCalledWith(
          'calculation.calculationDateTime >= :fromDateTime',
          {
            fromDateTime: '2026-07-01 00:00:00.000',
          },
        );

        /**
         * Debe agregarse un filtro para la fecha final.
         */
        expect(queryBuilderMock.andWhere).toHaveBeenCalledWith(
          'calculation.calculationDateTime <= :toDateTime',
          {
            toDateTime: '2026-07-31 23:59:59.999',
          },
        );

        expect(result.data).toHaveLength(1);

        expect(result.pagination.totalItems).toBe(1);
      });

      it('debe aplicar correctamente la paginación en una página posterior', async () => {
        const calculations = [
          createCalculation({
            id: 21,
          }),
          createCalculation({
            id: 22,
          }),
        ];

        /**
         * Simulamos que existen 45 registros en total,
         * aunque la página actual devuelve solamente dos entidades.
         */
        queryBuilderMock.getManyAndCount.mockResolvedValue([
          calculations,
          45,
        ]);

        const result = await service.findAll({
          page: 3,
          limit: 20,
          sortBy: 'calculationDateTime',
          sortOrder: 'DESC',
        });

        /**
         * Página 3 con límite 20:
         *
         * skip = (3 - 1) * 20 = 40
         */
        expect(queryBuilderMock.skip).toHaveBeenCalledWith(40);
        expect(queryBuilderMock.take).toHaveBeenCalledWith(20);

        expect(result.data).toHaveLength(2);

        expect(result.pagination).toEqual({
          page: 3,
          limit: 20,
          totalItems: 45,
          totalPages: 3,
          hasPreviousPage: true,
          hasNextPage: false,
        });
      });

      it('debe ordenar el historial por monto recaudado de forma ascendente', async () => {
        const calculation = createCalculation();

        queryBuilderMock.getManyAndCount.mockResolvedValue([
          [calculation],
          1,
        ]);

        const result = await service.findAll({
          page: 1,
          limit: 10,
          sortBy: 'collectionAmount',
          sortOrder: 'ASC',
        });

        expect(queryBuilderMock.orderBy).toHaveBeenCalledWith(
          'calculation.collectionAmount',
          'ASC',
        );

        expect(result.data).toHaveLength(1);

        expect(result.pagination.totalItems).toBe(1);
      });
    });
    describe('getDashboard', () => {
      it('debe devolver correctamente las estadísticas generales del dashboard', async () => {
        /**
         * Primera respuesta: estadísticas generales.
         *
         * PostgreSQL devuelve los resultados de COUNT, SUM y AVG
         * como strings en las consultas agregadas.
         */
        queryBuilderMock.getRawOne
          .mockResolvedValueOnce({
            calculationCount: '4',
            totalCollectionAmount: '10000000',
            totalCommissionAmount: '250000',
            bankCommissionAmount: '30000',
            clientCommissionAmount: '20000',
            ownCommissionAmount: '200000',
            averageCollectionAmount: '2500000',
          })

          /**
           * Segunda respuesta: grupo con mayor recaudación.
           */
          .mockResolvedValueOnce({
            id: '1',
            name: 'Silvina C',
            totalCollectionAmount: '6000000',
          })

          /**
           * Tercera respuesta: banco más utilizado.
           */
          .mockResolvedValueOnce({
            id: '2',
            name: 'Telepagos',
            calculationCount: '3',
          });

        const result = await service.getDashboard({});

        /**
         * El dashboard ejecuta tres consultas diferentes.
         */
        expect(
          commissionCalculationsRepositoryMock.createQueryBuilder,
        ).toHaveBeenCalledTimes(3);

        expect(
          commissionCalculationsRepositoryMock.createQueryBuilder,
        ).toHaveBeenNthCalledWith(1, 'calculation');

        expect(
          commissionCalculationsRepositoryMock.createQueryBuilder,
        ).toHaveBeenNthCalledWith(2, 'calculation');

        expect(
          commissionCalculationsRepositoryMock.createQueryBuilder,
        ).toHaveBeenNthCalledWith(3, 'calculation');

        /**
         * Verifica que las tres consultas hayan solicitado
         * sus respectivos resultados agregados.
         */
        expect(queryBuilderMock.getRawOne).toHaveBeenCalledTimes(3);

        /**
         * Comprueba la transformación de strings a números
         * y la estructura pública de respuesta.
         */
        expect(result).toEqual({
          from: null,
          to: null,

          calculationCount: 4,

          totalCollectionAmount: 10000000,
          totalCommissionAmount: 250000,
          bankCommissionAmount: 30000,
          clientCommissionAmount: 20000,
          ownCommissionAmount: 200000,
          averageCollectionAmount: 2500000,

          topGroup: {
            id: 1,
            name: 'Silvina C',
            totalCollectionAmount: 6000000,
          },

          topBank: {
            id: 2,
            name: 'Telepagos',
            calculationCount: 3,
          },
        });
      });

      it('debe devolver estadísticas vacías cuando no existen liquidaciones', async () => {
        /**
         * Consulta agregada principal.
         */
        queryBuilderMock.getRawOne
          .mockResolvedValueOnce({
            calculationCount: '0',
            totalCollectionAmount: '0',
            totalCommissionAmount: '0',
            bankCommissionAmount: '0',
            clientCommissionAmount: '0',
            ownCommissionAmount: '0',
            averageCollectionAmount: '0',
          })

          /**
           * No existe grupo con mayor recaudación.
           */
          .mockResolvedValueOnce(null)

          /**
           * No existe banco más utilizado.
           */
          .mockResolvedValueOnce(null);

        const result = await service.getDashboard({});

        expect(queryBuilderMock.getRawOne).toHaveBeenCalledTimes(3);

        expect(result).toEqual({
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
        });
      });

      it('debe lanzar una excepción cuando la fecha inicial es posterior a la fecha final', async () => {
        await expect(
          service.getDashboard({
            from: '2026-07-31',
            to: '2026-07-01',
          }),
        ).rejects.toThrow(
          'La fecha inicial no puede ser posterior a la fecha final.',
        );

        /**
         * La consulta nunca debe ejecutarse.
         */
        expect(
          commissionCalculationsRepositoryMock.createQueryBuilder,
        ).not.toHaveBeenCalled();

        expect(queryBuilderMock.getRawOne).not.toHaveBeenCalled();
      });

      it('debe aplicar el filtro de fechas en todas las consultas del dashboard', async () => {
        queryBuilderMock.getRawOne
          .mockResolvedValueOnce({
            calculationCount: '1',
            totalCollectionAmount: '100',
            totalCommissionAmount: '2.5',
            bankCommissionAmount: '0.3',
            clientCommissionAmount: '0',
            ownCommissionAmount: '2.2',
            averageCollectionAmount: '100',
          })
          .mockResolvedValueOnce(null)
          .mockResolvedValueOnce(null);

        await service.getDashboard({
          from: '2026-07-01',
          to: '2026-07-31',
        });

        /**
         * Cada consulta agrega dos filtros:
         *
         * >= fromDateTime
         * <= toDateTime
         *
         * Hay tres consultas en total.
         */
        expect(queryBuilderMock.andWhere).toHaveBeenCalledTimes(6);

        expect(queryBuilderMock.andWhere).toHaveBeenCalledWith(
          'calculation.calculationDateTime >= :fromDateTime',
          {
            fromDateTime: '2026-07-01 00:00:00.000',
          },
        );

        expect(queryBuilderMock.andWhere).toHaveBeenCalledWith(
          'calculation.calculationDateTime <= :toDateTime',
          {
            toDateTime: '2026-07-31 23:59:59.999',
          },
        );
      });
    });
  });
});