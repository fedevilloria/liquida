import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BanksModule } from '../banks/banks.module';
import { GroupsModule } from '../groups/groups.module';
import { CommissionCalculationsController } from './commission-calculations.controller';
import { CommissionCalculationsService } from './commission-calculations.service';
import { CommissionCalculation } from './entities/commission-calculation.entity';

@Module({
  imports: [
    // Registra el repositorio de liquidaciones.
    TypeOrmModule.forFeature([CommissionCalculation]),

    // Permiten utilizar los servicios de grupos y bancos.
    GroupsModule,
    BanksModule,
  ],
  controllers: [
    // Expone los endpoints HTTP de liquidaciones.
    CommissionCalculationsController,
  ],
  providers: [
    // Contiene la lógica de negocio del cálculo.
    CommissionCalculationsService,
  ],
  exports: [
    // Permite reutilizar el servicio desde otros módulos futuros.
    CommissionCalculationsService,
  ],
})
export class CommissionCalculationsModule {}