import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Group } from './entities/group.entity';
import { GroupsController } from './groups.controller';
import { GroupsService } from './groups.service';

@Module({
  imports: [

    // Registra la entidad Group para que pueda
    // utilizarse mediante el repositorio de TypeORM.
    TypeOrmModule.forFeature([Group]),

  ],

  controllers: [

    // Controlador encargado de recibir las solicitudes HTTP.
    GroupsController,

  ],

  providers: [

    // Servicio donde se implementará la lógica de negocio.
    GroupsService,

  ],

  exports: [

    // Exportamos el servicio para reutilizarlo
    // desde otros módulos del sistema.
    GroupsService,

  ],
})
export class GroupsModule {}