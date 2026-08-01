import { Test, TestingModule } from '@nestjs/testing';

import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { Group } from './entities/group.entity';
import { GroupsController } from './groups.controller';
import { GroupsService } from './groups.service';

/**
 * Crea un grupo válido para reutilizarlo
 * en las distintas pruebas del controlador.
 */
const createGroup = (overrides: Partial<Group> = {}): Group => ({
  id: 1,
  name: 'Grupo Norte',
  active: true,
  createdAt: new Date('2026-07-30T10:00:00.000Z'),
  updatedAt: new Date('2026-07-30T10:00:00.000Z'),
  ...overrides,
});

describe('GroupsController', () => {
  let controller: GroupsController;

  /**
   * Mock del servicio.
   *
   * El objetivo de estas pruebas no es volver
   * a validar la lógica de negocio, sino comprobar
   * que cada método del controlador delega correctamente.
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

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupsController],
      providers: [
        {
          provide: GroupsService,
          useValue: groupsServiceMock,
        },
      ],
    }).compile();

    controller = module.get<GroupsController>(GroupsController);
  });

  it('debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('debe delegar la creación de un grupo en el servicio', async () => {
      const dto: CreateGroupDto = {
        name: 'Grupo Norte',
      };

      const createdGroup = createGroup();

      groupsServiceMock.create.mockResolvedValue(createdGroup);

      const result = await controller.create(dto);

      expect(groupsServiceMock.create).toHaveBeenCalledTimes(1);
      expect(groupsServiceMock.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(createdGroup);
    });
  });

  describe('findAll', () => {
    it('debe delegar la consulta de todos los grupos en el servicio', async () => {
      const groups = [
        createGroup(),
        createGroup({
          id: 2,
          name: 'Grupo Sur',
          active: false,
        }),
      ];

      groupsServiceMock.findAll.mockResolvedValue(groups);

      const result = await controller.findAll();

      expect(groupsServiceMock.findAll).toHaveBeenCalledTimes(1);
      expect(groupsServiceMock.findAll).toHaveBeenCalledWith();
      expect(result).toEqual(groups);
    });
  });

  describe('findAllActive', () => {
    it('debe delegar la consulta de grupos activos en el servicio', async () => {
      const activeGroups = [
        createGroup(),
        createGroup({
          id: 2,
          name: 'Grupo Sur',
        }),
      ];

      groupsServiceMock.findAllActive.mockResolvedValue(activeGroups);

      const result = await controller.findAllActive();

      expect(groupsServiceMock.findAllActive).toHaveBeenCalledTimes(1);

      expect(groupsServiceMock.findAllActive).toHaveBeenCalledWith();

      expect(result).toEqual(activeGroups);
    });
  });

  describe('findOne', () => {
    it('debe delegar la búsqueda de un grupo por ID en el servicio', async () => {
      const group = createGroup();

      groupsServiceMock.findOne.mockResolvedValue(group);

      const result = await controller.findOne(1);

      expect(groupsServiceMock.findOne).toHaveBeenCalledTimes(1);
      expect(groupsServiceMock.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(group);
    });
  });

  describe('update', () => {
    it('debe delegar la actualización de un grupo en el servicio', async () => {
      const dto: UpdateGroupDto = {
        name: 'Grupo Centro',
      };

      const updatedGroup = createGroup({
        name: 'Grupo Centro',
      });

      groupsServiceMock.update.mockResolvedValue(updatedGroup);

      const result = await controller.update(1, dto);

      expect(groupsServiceMock.update).toHaveBeenCalledTimes(1);
      expect(groupsServiceMock.update).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual(updatedGroup);
    });
  });

  describe('restore', () => {
    it('debe delegar la reactivación de un grupo en el servicio', async () => {
      const restoredGroup = createGroup({
        active: true,
      });

      groupsServiceMock.restore.mockResolvedValue(restoredGroup);

      const result = await controller.restore(1);

      expect(groupsServiceMock.restore).toHaveBeenCalledTimes(1);
      expect(groupsServiceMock.restore).toHaveBeenCalledWith(1);
      expect(result).toEqual(restoredGroup);
    });
  });

  describe('remove', () => {
    it('debe delegar la desactivación de un grupo en el servicio', async () => {
      const inactiveGroup = createGroup({
        active: false,
      });

      groupsServiceMock.remove.mockResolvedValue(inactiveGroup);

      const result = await controller.remove(1);

      expect(groupsServiceMock.remove).toHaveBeenCalledTimes(1);
      expect(groupsServiceMock.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual(inactiveGroup);
    });
  });
});
