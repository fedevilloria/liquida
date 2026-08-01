import { Test, TestingModule } from '@nestjs/testing';

import { BanksController } from './banks.controller';
import { BanksService } from './banks.service';
import { CreateBankDto } from './dto/create-bank.dto';
import { UpdateBankDto } from './dto/update-bank.dto';
import { Bank } from './entities/bank.entity';

/**
 * Crea un banco válido para reutilizarlo
 * en las distintas pruebas del controlador.
 */
const createBank = (overrides: Partial<Bank> = {}): Bank => ({
  id: 1,
  name: 'Banco Macro',
  commissionPercentage: 0.8,
  active: true,
  createdAt: new Date('2026-07-30T10:00:00.000Z'),
  updatedAt: new Date('2026-07-30T10:00:00.000Z'),
  ...overrides,
});

describe('BanksController', () => {
  let controller: BanksController;

  /**
   * Mock del servicio.
   *
   * Estas pruebas verifican que el controlador
   * delegue correctamente cada operación.
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

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BanksController],
      providers: [
        {
          provide: BanksService,
          useValue: banksServiceMock,
        },
      ],
    }).compile();

    controller = module.get<BanksController>(BanksController);
  });

  it('debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('debe delegar la creación de un banco en el servicio', async () => {
      const dto: CreateBankDto = {
        name: 'Banco Macro',
        commissionPercentage: 0.8,
      };

      const createdBank = createBank();

      banksServiceMock.create.mockResolvedValue(createdBank);

      const result = await controller.create(dto);

      expect(banksServiceMock.create).toHaveBeenCalledTimes(1);
      expect(banksServiceMock.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(createdBank);
    });
  });

  describe('findAll', () => {
    it('debe delegar la consulta de todos los bancos en el servicio', async () => {
      const banks = [
        createBank(),
        createBank({
          id: 2,
          name: 'Banco Nación',
          commissionPercentage: 1,
          active: false,
        }),
      ];

      banksServiceMock.findAll.mockResolvedValue(banks);

      const result = await controller.findAll();

      expect(banksServiceMock.findAll).toHaveBeenCalledTimes(1);
      expect(banksServiceMock.findAll).toHaveBeenCalledWith();
      expect(result).toEqual(banks);
    });
  });

  describe('findAllActive', () => {
    it('debe delegar la consulta de bancos activos en el servicio', async () => {
      const activeBanks = [
        createBank(),
        createBank({
          id: 2,
          name: 'Banco Nación',
          commissionPercentage: 1,
        }),
      ];

      banksServiceMock.findAllActive.mockResolvedValue(activeBanks);

      const result = await controller.findAllActive();

      expect(banksServiceMock.findAllActive).toHaveBeenCalledTimes(1);

      expect(banksServiceMock.findAllActive).toHaveBeenCalledWith();

      expect(result).toEqual(activeBanks);
    });
  });

  describe('findOne', () => {
    it('debe delegar la búsqueda de un banco por ID en el servicio', async () => {
      const bank = createBank();

      banksServiceMock.findOne.mockResolvedValue(bank);

      const result = await controller.findOne(1);

      expect(banksServiceMock.findOne).toHaveBeenCalledTimes(1);
      expect(banksServiceMock.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(bank);
    });
  });

  describe('update', () => {
    it('debe delegar la actualización de un banco en el servicio', async () => {
      const dto: UpdateBankDto = {
        name: 'Banco Nación',
        commissionPercentage: 1,
      };

      const updatedBank = createBank({
        name: 'Banco Nación',
        commissionPercentage: 1,
      });

      banksServiceMock.update.mockResolvedValue(updatedBank);

      const result = await controller.update(1, dto);

      expect(banksServiceMock.update).toHaveBeenCalledTimes(1);
      expect(banksServiceMock.update).toHaveBeenCalledWith(1, dto);

      expect(result).toEqual(updatedBank);
    });
  });

  describe('restore', () => {
    it('debe delegar la reactivación de un banco en el servicio', async () => {
      const restoredBank = createBank({
        active: true,
      });

      banksServiceMock.restore.mockResolvedValue(restoredBank);

      const result = await controller.restore(1);

      expect(banksServiceMock.restore).toHaveBeenCalledTimes(1);
      expect(banksServiceMock.restore).toHaveBeenCalledWith(1);
      expect(result).toEqual(restoredBank);
    });
  });

  describe('remove', () => {
    it('debe delegar la desactivación de un banco en el servicio', async () => {
      const inactiveBank = createBank({
        active: false,
      });

      banksServiceMock.remove.mockResolvedValue(inactiveBank);

      const result = await controller.remove(1);

      expect(banksServiceMock.remove).toHaveBeenCalledTimes(1);
      expect(banksServiceMock.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual(inactiveBank);
    });
  });
});
