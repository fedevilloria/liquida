import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { createDatabaseConfig } from './config/database.config';
import { GroupsModule } from './groups/groups.module';

@Module({
  imports: [
    // Carga las variables del archivo .env
    // y las deja disponibles para toda la aplicación.
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Espera a que ConfigModule cargue las variables
    // antes de construir la configuración de TypeORM.
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],

      inject: [ConfigService],

      useFactory: createDatabaseConfig,
    }),

    // Módulo encargado de la administración de grupos.
    GroupsModule,
  ],
})
export class AppModule {}