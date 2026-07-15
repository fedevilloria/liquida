import { Test, TestingModule } from '@nestjs/testing';
import { CommissionCalculationsService } from './commission-calculations.service';

describe('CommissionCalculationsService', () => {
  let service: CommissionCalculationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CommissionCalculationsService],
    }).compile();

    service = module.get<CommissionCalculationsService>(CommissionCalculationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
