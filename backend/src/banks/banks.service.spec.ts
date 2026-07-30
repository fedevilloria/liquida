import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { BanksService } from './banks.service';
import { Bank } from './entities/bank.entity';

describe('BanksService', () => {
  let service: BanksService;

  /**
   * Mock mínimo del repositorio utilizado por BanksService.
   */
  const bankRepositoryMock = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BanksService,
        {
          provide: getRepositoryToken(Bank),
          useValue: bankRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<BanksService>(BanksService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});