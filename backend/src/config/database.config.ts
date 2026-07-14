import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

/**
 * Construye la configuración de PostgreSQL utilizando ConfigService.
 *
 * Esto garantiza que las variables del archivo .env ya hayan sido
 * cargadas antes de intentar establecer la conexión con la base de datos.
 */
export const createDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  return {
    type: 'postgres',

    host: configService.getOrThrow<string>('DB_HOST'),

    port: configService.getOrThrow<number>('DB_PORT'),

    username: configService.getOrThrow<string>('DB_USERNAME'),

    password: configService.getOrThrow<string>('DB_PASSWORD'),

    database: configService.getOrThrow<string>('DB_NAME'),

    // Detecta automáticamente las entidades registradas
    // mediante TypeOrmModule.forFeature().
    autoLoadEntities: true,

    // Mantiene la estructura de las tablas sincronizada
    // durante el desarrollo del sistema.
    synchronize: true,
  };
};