import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Group } from './entities/group.entity';
import { GroupsController } from './groups.controller';
import { GroupsService } from './groups.service';

@Module({
  imports: [
    // Registra el repositorio de Group dentro del módulo.
    TypeOrmModule.forFeature([Group]),
  ],
  controllers: [
    // Expone los endpoints HTTP relacionados con grupos.
    GroupsController,
  ],
  providers: [
    // Contiene la lógica de negocio y persistencia.
    GroupsService,
  ],
  exports: [
    // Permite reutilizar el servicio desde otros módulos,
    // como CommissionCalculationsModule.
    GroupsService,
  ],
})
export class GroupsModule {}
