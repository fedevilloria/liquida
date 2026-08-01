import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BanksModule } from './banks/banks.module';
import { CommissionCalculationsModule } from './commission-calculations/commission-calculations.module';
import { createDatabaseConfig } from './config/database.config';
import { validateEnvironment } from './config/env.validation';
import { GroupsModule } from './groups/groups.module';

@Module({
  imports: [
    /**
     * Carga, valida y transforma las variables
     * de entorno utilizadas por toda la aplicación.
     */
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: validateEnvironment,
    }),

    /**
     * Espera a que ConfigModule haya cargado
     * y validado las variables antes de configurar TypeORM.
     */
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: createDatabaseConfig,
    }),

    // Módulo encargado de la administración de grupos.
    GroupsModule,

    // Módulo encargado de la administración de bancos.
    BanksModule,

    // Módulo encargado del registro y consulta de liquidaciones.
    CommissionCalculationsModule,
  ],
})
export class AppModule {}
