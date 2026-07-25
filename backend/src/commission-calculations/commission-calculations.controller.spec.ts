import { Test, TestingModule } from '@nestjs/testing';
import { CommissionCalculationsController } from './commission-calculations.controller';
import { CommissionCalculationsService } from './commission-calculations.service';

describe('CommissionCalculationsController', () => {
  let controller: CommissionCalculationsController;

  /*
   * Simulamos el servicio para que la prueba del controlador
   * no acceda a la base de datos ni ejecute reglas de negocio reales.
   */
  const commissionCalculationsServiceMock = {
    registerCalculation: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    getDashboard: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommissionCalculationsController],
      providers: [
        {
          provide: CommissionCalculationsService,
          useValue: commissionCalculationsServiceMock,
        },
      ],
    }).compile();

    controller = module.get<CommissionCalculationsController>(
      CommissionCalculationsController,
    );
  });

  /*
   * Limpiamos el historial de llamadas de todos los mocks
   * antes de ejecutar cada prueba.
   */
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});