import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GroupsModule } from './groups/groups.module';

@Module({
  imports: [
    // Carga las variables de entorno para que estén disponibles
    // en todos los módulos de la aplicación.
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Configura la conexión principal con PostgreSQL.
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,

      // Permite que TypeORM detecte las entidades registradas
      // dentro de cada módulo mediante forFeature().
      autoLoadEntities: true,

      // Mantiene las tablas sincronizadas durante el desarrollo.
      // En producción será reemplazado por migraciones.
      synchronize: true,
    }),

    // Módulo encargado de la administración de grupos.
    GroupsModule,
  ],
})
export class AppModule {}