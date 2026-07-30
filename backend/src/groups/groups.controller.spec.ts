import { Test, TestingModule } from '@nestjs/testing';

import { GroupsController } from './groups.controller';
import { GroupsService } from './groups.service';

describe('GroupsController', () => {
  let controller: GroupsController;

  /**
   * Mock del servicio para probar el controlador
   * sin acceder al repositorio ni a PostgreSQL.
   */
  const groupsServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    reactivate: jest.fn(),
  };

  beforeEach(async () => {
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

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});