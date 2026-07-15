import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Bank } from './entities/bank.entity';
import { BanksController } from './banks.controller';
import { BanksService } from './banks.service';

@Module({
  imports: [
    // Registra el repositorio de Bank dentro de este módulo.
    TypeOrmModule.forFeature([Bank]),
  ],
  controllers: [
    // Expone los endpoints HTTP relacionados con bancos.
    BanksController,
  ],
  providers: [
    // Contiene la lógica de negocio y persistencia.
    BanksService,
  ],
  exports: [
    // Permite reutilizar el servicio desde el módulo
    // de cálculos de comisión.
    BanksService,
  ],
})
export class BanksModule {}