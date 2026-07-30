import { Test, TestingModule } from '@nestjs/testing';

import { BanksController } from './banks.controller';
import { BanksService } from './banks.service';

describe('BanksController', () => {
  let controller: BanksController;

  /**
   * Mock del servicio para probar el controlador
   * sin acceder al repositorio ni a PostgreSQL.
   */
  const banksServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    reactivate: jest.fn(),
  };

  beforeEach(async () => {
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

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});