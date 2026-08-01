import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ILike } from 'typeorm';
import { Bank } from './entities/bank.entity';
import { BanksService } from './banks.service';

/**
 * Crea un banco válido para reutilizarlo en las pruebas.
 *
 * Cada test puede reemplazar únicamente los campos
 * que necesite mediante overrides.
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

describe('BanksService', () => {
  let service: BanksService;

  /**
   * Mock del repositorio de bancos.
   *
   * Reemplaza las operaciones reales de TypeORM
   * para evitar acceder a PostgreSQL durante las pruebas.
   */
  const banksRepositoryMock = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    merge: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BanksService,
        {
          provide: getRepositoryToken(Bank),
          useValue: banksRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<BanksService>(BanksService);
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('debe registrar correctamente un banco', async () => {
      const createBankDto = {
        name: 'Banco Macro',
        commissionPercentage: 0.8,
      };

      const createdBank = createBank({
        id: undefined,
      });

      const savedBank = createBank();

      /**
       * La primera búsqueda corresponde a la validación
       * de unicidad del nombre.
       */
      banksRepositoryMock.findOne.mockResolvedValue(null);

      banksRepositoryMock.create.mockReturnValue(createdBank);
      banksRepositoryMock.save.mockResolvedValue(savedBank);

      const result = await service.create(createBankDto);

      expect(banksRepositoryMock.findOne).toHaveBeenCalledWith({
        where: {
          name: ILike('Banco Macro'),
        },
      });

      expect(banksRepositoryMock.create).toHaveBeenCalledWith({
        name: 'Banco Macro',
        commissionPercentage: 0.8,
      });

      expect(banksRepositoryMock.save).toHaveBeenCalledWith(createdBank);

      expect(result).toEqual(savedBank);
    });

    it('debe lanzar ConflictException cuando el nombre ya existe', async () => {
      const existingBank = createBank();

      banksRepositoryMock.findOne.mockResolvedValue(existingBank);

      await expect(
        service.create({
          name: 'Banco Macro',
          commissionPercentage: 0.8,
        }),
      ).rejects.toBeInstanceOf(ConflictException);

      await expect(
        service.create({
          name: 'Banco Macro',
          commissionPercentage: 0.8,
        }),
      ).rejects.toThrow(
        'Ya existe un banco registrado con el nombre "Banco Macro".',
      );

      expect(banksRepositoryMock.create).not.toHaveBeenCalled();
      expect(banksRepositoryMock.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('debe devolver todos los bancos ordenados por estado y nombre', async () => {
      const banks = [
        createBank(),
        createBank({
          id: 2,
          name: 'Banco Nación',
          commissionPercentage: 1,
          active: false,
        }),
      ];

      banksRepositoryMock.find.mockResolvedValue(banks);

      const result = await service.findAll();

      expect(banksRepositoryMock.find).toHaveBeenCalledWith({
        order: {
          active: 'DESC',
          name: 'ASC',
        },
      });

      expect(result).toEqual(banks);
    });
  });

  describe('findAllActive', () => {
    it('debe devolver únicamente los bancos activos', async () => {
      const activeBanks = [
        createBank(),
        createBank({
          id: 2,
          name: 'Banco Nación',
          commissionPercentage: 1,
        }),
      ];

      banksRepositoryMock.find.mockResolvedValue(activeBanks);

      const result = await service.findAllActive();

      expect(banksRepositoryMock.find).toHaveBeenCalledWith({
        where: {
          active: true,
        },
        order: {
          name: 'ASC',
        },
      });

      expect(result).toEqual(activeBanks);
    });
  });

  describe('findOne', () => {
    it('debe devolver un banco cuando existe', async () => {
      const bank = createBank();

      banksRepositoryMock.findOne.mockResolvedValue(bank);

      const result = await service.findOne(1);

      expect(banksRepositoryMock.findOne).toHaveBeenCalledWith({
        where: {
          id: 1,
        },
      });

      expect(result).toEqual(bank);
    });

    it('debe lanzar NotFoundException cuando el banco no existe', async () => {
      banksRepositoryMock.findOne.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toBeInstanceOf(
        NotFoundException,
      );

      await expect(service.findOne(99)).rejects.toThrow(
        'No se encontró el banco con ID 99.',
      );
    });
  });

  describe('update', () => {
    it('debe actualizar los datos de un banco', async () => {
      const bank = createBank();

      const updatedBank = createBank({
        name: 'Banco Nación',
        commissionPercentage: 1,
      });

      /**
       * Primera llamada:
       * findOne(id) busca el banco por identificador.
       *
       * Segunda llamada:
       * validateUniqueName() comprueba que el nuevo nombre
       * no pertenezca a otro banco.
       */
      banksRepositoryMock.findOne
        .mockResolvedValueOnce(bank)
        .mockResolvedValueOnce(null);

      banksRepositoryMock.merge.mockImplementation(
        (target: Bank, source: Partial<Bank>) => Object.assign(target, source),
      );

      banksRepositoryMock.save.mockResolvedValue(updatedBank);

      const result = await service.update(1, {
        name: 'Banco Nación',
        commissionPercentage: 1,
      });

      expect(banksRepositoryMock.findOne).toHaveBeenNthCalledWith(1, {
        where: {
          id: 1,
        },
      });

      expect(banksRepositoryMock.findOne).toHaveBeenNthCalledWith(2, {
        where: {
          name: ILike('Banco Nación'),
        },
      });

      expect(banksRepositoryMock.merge).toHaveBeenCalledWith(bank, {
        name: 'Banco Nación',
        commissionPercentage: 1,
      });

      expect(banksRepositoryMock.save).toHaveBeenCalledWith(bank);
      expect(result).toEqual(updatedBank);
    });

    it('debe actualizar únicamente el porcentaje de comisión', async () => {
      const bank = createBank();

      const updatedBank = createBank({
        commissionPercentage: 1.2,
      });

      banksRepositoryMock.findOne.mockResolvedValue(bank);

      banksRepositoryMock.merge.mockImplementation(
        (target: Bank, source: Partial<Bank>) => Object.assign(target, source),
      );

      banksRepositoryMock.save.mockResolvedValue(updatedBank);

      const result = await service.update(1, {
        commissionPercentage: 1.2,
      });

      /**
       * Como no se modifica el nombre, no debe ejecutarse
       * una segunda consulta para validar su unicidad.
       */
      expect(banksRepositoryMock.findOne).toHaveBeenCalledTimes(1);

      expect(banksRepositoryMock.merge).toHaveBeenCalledWith(bank, {
        commissionPercentage: 1.2,
      });

      expect(banksRepositoryMock.save).toHaveBeenCalledWith(bank);
      expect(result).toEqual(updatedBank);
    });

    it('no debe validar nuevamente el nombre cuando no cambió', async () => {
      const bank = createBank();

      banksRepositoryMock.findOne.mockResolvedValue(bank);

      banksRepositoryMock.merge.mockImplementation(
        (target: Bank, source: Partial<Bank>) => Object.assign(target, source),
      );

      banksRepositoryMock.save.mockResolvedValue(bank);

      const result = await service.update(1, {
        name: 'Banco Macro',
      });

      expect(banksRepositoryMock.findOne).toHaveBeenCalledTimes(1);

      expect(banksRepositoryMock.merge).toHaveBeenCalledWith(bank, {
        name: 'Banco Macro',
      });

      expect(banksRepositoryMock.save).toHaveBeenCalledWith(bank);
      expect(result).toEqual(bank);
    });

    it('debe lanzar ConflictException cuando el nuevo nombre pertenece a otro banco', async () => {
      const bank = createBank();

      const conflictingBank = createBank({
        id: 2,
        name: 'Banco Nación',
      });

      banksRepositoryMock.findOne
        .mockResolvedValueOnce(bank)
        .mockResolvedValueOnce(conflictingBank);

      await expect(
        service.update(1, {
          name: 'Banco Nación',
        }),
      ).rejects.toBeInstanceOf(ConflictException);

      expect(banksRepositoryMock.merge).not.toHaveBeenCalled();
      expect(banksRepositoryMock.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('debe desactivar un banco mediante borrado lógico', async () => {
      const bank = createBank();

      banksRepositoryMock.findOne.mockResolvedValue(bank);

      banksRepositoryMock.save.mockImplementation(
        (savedBank: Bank): Promise<Bank> => Promise.resolve(savedBank),
      );

      const result = await service.remove(1);

      expect(bank.active).toBe(false);
      expect(banksRepositoryMock.save).toHaveBeenCalledWith(bank);
      expect(result.active).toBe(false);
    });

    it('debe lanzar NotFoundException cuando se intenta desactivar un banco inexistente', async () => {
      banksRepositoryMock.findOne.mockResolvedValue(null);

      await expect(service.remove(99)).rejects.toBeInstanceOf(
        NotFoundException,
      );

      expect(banksRepositoryMock.save).not.toHaveBeenCalled();
    });
  });

  describe('restore', () => {
    it('debe reactivar un banco previamente desactivado', async () => {
      const inactiveBank = createBank({
        active: false,
      });

      banksRepositoryMock.findOne.mockResolvedValue(inactiveBank);

      banksRepositoryMock.save.mockImplementation(
        (savedBank: Bank): Promise<Bank> => Promise.resolve(savedBank),
      );

      const result = await service.restore(1);

      expect(inactiveBank.active).toBe(true);
      expect(banksRepositoryMock.save).toHaveBeenCalledWith(inactiveBank);
      expect(result.active).toBe(true);
    });

    it('debe lanzar NotFoundException cuando se intenta reactivar un banco inexistente', async () => {
      banksRepositoryMock.findOne.mockResolvedValue(null);

      await expect(service.restore(99)).rejects.toBeInstanceOf(
        NotFoundException,
      );

      expect(banksRepositoryMock.save).not.toHaveBeenCalled();
    });
  });
});
