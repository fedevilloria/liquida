import { Test, TestingModule } from '@nestjs/testing';
import { CommissionCalculationsController } from './commission-calculations.controller';

describe('CommissionCalculationsController', () => {
  let controller: CommissionCalculationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommissionCalculationsController],
    }).compile();

    controller = module.get<CommissionCalculationsController>(CommissionCalculationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
