import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

/**
 * Construye la configuración de PostgreSQL utilizando ConfigService.
 *
 * Las variables ya fueron validadas y transformadas
 * por ConfigModule antes de ejecutar esta función.
 */
export const createDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const nodeEnvironment = configService.getOrThrow<string>('NODE_ENV');

  const isProduction = nodeEnvironment === 'production';

  return {
    type: 'postgres',

    host: configService.getOrThrow<string>('DB_HOST'),

    port: configService.getOrThrow<number>('DB_PORT'),

    username: configService.getOrThrow<string>('DB_USERNAME'),

    password: configService.getOrThrow<string>('DB_PASSWORD'),

    database: configService.getOrThrow<string>('DB_NAME'),

    /**
     * Detecta automáticamente las entidades registradas
     * mediante TypeOrmModule.forFeature().
     */
    autoLoadEntities: true,

    /**
     * Durante el desarrollo, TypeORM puede mantener
     * automáticamente sincronizada la estructura.
     *
     * En producción se desactiva para evitar modificaciones
     * automáticas del esquema. Allí deberán utilizarse
     * migraciones o un esquema preparado previamente.
     */
    synchronize: !isProduction,

    /**
     * Muestra consultas y errores de base de datos
     * únicamente fuera del entorno productivo.
     */
    logging: !isProduction,
  };
};
