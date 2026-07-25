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
   * Mock del repositorio de liquidaciones.
   *
   * Reemplaza las operaciones reales de TypeORM para evitar
   * conexiones a PostgreSQL durante las pruebas unitarias.
   */
  const commissionCalculationsRepositoryMock = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
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
    jest.resetAllMocks();

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
});