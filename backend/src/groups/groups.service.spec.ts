import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ILike } from 'typeorm';
import { Group } from './entities/group.entity';
import { GroupsService } from './groups.service';

/**
 * Crea un grupo válido para reutilizarlo en las pruebas.
 *
 * Cada test puede reemplazar únicamente los campos
 * que necesite mediante overrides.
 */
const createGroup = (overrides: Partial<Group> = {}): Group => ({
  id: 1,
  name: 'Grupo Norte',
  active: true,
  createdAt: new Date('2026-07-30T10:00:00.000Z'),
  updatedAt: new Date('2026-07-30T10:00:00.000Z'),
  ...overrides,
});

describe('GroupsService', () => {
  let service: GroupsService;

  /**
   * Mock del repositorio de grupos.
   *
   * Reemplaza las operaciones reales de TypeORM
   * para que las pruebas no accedan a PostgreSQL.
   */
  const groupsRepositoryMock = {
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
        GroupsService,
        {
          provide: getRepositoryToken(Group),
          useValue: groupsRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<GroupsService>(GroupsService);
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('debe registrar correctamente un grupo', async () => {
      const createGroupDto = {
        name: 'Grupo Norte',
      };

      const createdGroup = createGroup({
        id: undefined,
      });

      const savedGroup = createGroup();

      /**
       * La primera búsqueda corresponde a la validación
       * de unicidad del nombre.
       */
      groupsRepositoryMock.findOne.mockResolvedValue(null);

      groupsRepositoryMock.create.mockReturnValue(createdGroup);
      groupsRepositoryMock.save.mockResolvedValue(savedGroup);

      const result = await service.create(createGroupDto);

      expect(groupsRepositoryMock.findOne).toHaveBeenCalledWith({
        where: {
          name: ILike('Grupo Norte'),
        },
      });

      expect(groupsRepositoryMock.create).toHaveBeenCalledWith({
        name: 'Grupo Norte',
      });

      expect(groupsRepositoryMock.save).toHaveBeenCalledWith(createdGroup);

      expect(result).toEqual(savedGroup);
    });

    it('debe lanzar ConflictException cuando el nombre ya existe', async () => {
      const existingGroup = createGroup();

      groupsRepositoryMock.findOne.mockResolvedValue(existingGroup);

      await expect(
        service.create({
          name: 'Grupo Norte',
        }),
      ).rejects.toBeInstanceOf(ConflictException);

      await expect(
        service.create({
          name: 'Grupo Norte',
        }),
      ).rejects.toThrow(
        'Ya existe un grupo registrado con el nombre "Grupo Norte".',
      );

      expect(groupsRepositoryMock.create).not.toHaveBeenCalled();
      expect(groupsRepositoryMock.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('debe devolver todos los grupos ordenados por estado y nombre', async () => {
      const groups = [
        createGroup(),
        createGroup({
          id: 2,
          name: 'Grupo Sur',
          active: false,
        }),
      ];

      groupsRepositoryMock.find.mockResolvedValue(groups);

      const result = await service.findAll();

      expect(groupsRepositoryMock.find).toHaveBeenCalledWith({
        order: {
          active: 'DESC',
          name: 'ASC',
        },
      });

      expect(result).toEqual(groups);
    });
  });

  describe('findAllActive', () => {
    it('debe devolver únicamente los grupos activos', async () => {
      const activeGroups = [
        createGroup(),
        createGroup({
          id: 2,
          name: 'Grupo Sur',
        }),
      ];

      groupsRepositoryMock.find.mockResolvedValue(activeGroups);

      const result = await service.findAllActive();

      expect(groupsRepositoryMock.find).toHaveBeenCalledWith({
        where: {
          active: true,
        },
        order: {
          name: 'ASC',
        },
      });

      expect(result).toEqual(activeGroups);
    });
  });

  describe('findOne', () => {
    it('debe devolver un grupo cuando existe', async () => {
      const group = createGroup();

      groupsRepositoryMock.findOne.mockResolvedValue(group);

      const result = await service.findOne(1);

      expect(groupsRepositoryMock.findOne).toHaveBeenCalledWith({
        where: {
          id: 1,
        },
      });

      expect(result).toEqual(group);
    });

    it('debe lanzar NotFoundException cuando el grupo no existe', async () => {
      groupsRepositoryMock.findOne.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toBeInstanceOf(
        NotFoundException,
      );

      await expect(service.findOne(99)).rejects.toThrow(
        'No se encontró el grupo con ID 99.',
      );
    });
  });

  describe('update', () => {
    it('debe actualizar el nombre de un grupo', async () => {
      const group = createGroup();

      const updatedGroup = createGroup({
        name: 'Grupo Centro',
      });

      /**
       * Primera llamada:
       * findOne(id) busca el grupo por identificador.
       *
       * Segunda llamada:
       * validateUniqueName() comprueba que el nuevo nombre
       * no pertenezca a otro grupo.
       */
      groupsRepositoryMock.findOne
        .mockResolvedValueOnce(group)
        .mockResolvedValueOnce(null);

      groupsRepositoryMock.merge.mockImplementation(
        (target: Group, source: Partial<Group>) =>
          Object.assign(target, source),
      );

      groupsRepositoryMock.save.mockResolvedValue(updatedGroup);

      const result = await service.update(1, {
        name: 'Grupo Centro',
      });

      expect(groupsRepositoryMock.findOne).toHaveBeenNthCalledWith(1, {
        where: {
          id: 1,
        },
      });

      expect(groupsRepositoryMock.findOne).toHaveBeenNthCalledWith(2, {
        where: {
          name: ILike('Grupo Centro'),
        },
      });

      expect(groupsRepositoryMock.merge).toHaveBeenCalledWith(group, {
        name: 'Grupo Centro',
      });

      expect(groupsRepositoryMock.save).toHaveBeenCalledWith(group);
      expect(result).toEqual(updatedGroup);
    });

    it('no debe validar nuevamente el nombre cuando no cambió', async () => {
      const group = createGroup();

      groupsRepositoryMock.findOne.mockResolvedValue(group);

      groupsRepositoryMock.merge.mockImplementation(
        (target: Group, source: Partial<Group>) =>
          Object.assign(target, source),
      );

      groupsRepositoryMock.save.mockResolvedValue(group);

      const result = await service.update(1, {
        name: 'Grupo Norte',
      });

      expect(groupsRepositoryMock.findOne).toHaveBeenCalledTimes(1);

      expect(groupsRepositoryMock.merge).toHaveBeenCalledWith(group, {
        name: 'Grupo Norte',
      });

      expect(groupsRepositoryMock.save).toHaveBeenCalledWith(group);
      expect(result).toEqual(group);
    });

    it('debe lanzar ConflictException cuando el nuevo nombre pertenece a otro grupo', async () => {
      const group = createGroup();

      const conflictingGroup = createGroup({
        id: 2,
        name: 'Grupo Sur',
      });

      groupsRepositoryMock.findOne
        .mockResolvedValueOnce(group)
        .mockResolvedValueOnce(conflictingGroup);

      await expect(
        service.update(1, {
          name: 'Grupo Sur',
        }),
      ).rejects.toBeInstanceOf(ConflictException);

      expect(groupsRepositoryMock.merge).not.toHaveBeenCalled();
      expect(groupsRepositoryMock.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('debe desactivar un grupo mediante borrado lógico', async () => {
      const group = createGroup();

      groupsRepositoryMock.findOne.mockResolvedValue(group);

      groupsRepositoryMock.save.mockImplementation(
        (savedGroup: Group): Promise<Group> => Promise.resolve(savedGroup),
      );

      const result = await service.remove(1);

      expect(group.active).toBe(false);
      expect(groupsRepositoryMock.save).toHaveBeenCalledWith(group);
      expect(result.active).toBe(false);
    });

    it('debe lanzar NotFoundException cuando se intenta desactivar un grupo inexistente', async () => {
      groupsRepositoryMock.findOne.mockResolvedValue(null);

      await expect(service.remove(99)).rejects.toBeInstanceOf(
        NotFoundException,
      );

      expect(groupsRepositoryMock.save).not.toHaveBeenCalled();
    });
  });

  describe('restore', () => {
    it('debe reactivar un grupo previamente desactivado', async () => {
      const inactiveGroup = createGroup({
        active: false,
      });

      groupsRepositoryMock.findOne.mockResolvedValue(inactiveGroup);

      groupsRepositoryMock.save.mockImplementation(
        (savedGroup: Group): Promise<Group> => Promise.resolve(savedGroup),
      );

      const result = await service.restore(1);

      expect(inactiveGroup.active).toBe(true);
      expect(groupsRepositoryMock.save).toHaveBeenCalledWith(inactiveGroup);
      expect(result.active).toBe(true);
    });

    it('debe lanzar NotFoundException cuando se intenta reactivar un grupo inexistente', async () => {
      groupsRepositoryMock.findOne.mockResolvedValue(null);

      await expect(service.restore(99)).rejects.toBeInstanceOf(
        NotFoundException,
      );

      expect(groupsRepositoryMock.save).not.toHaveBeenCalled();
    });
  });
});
