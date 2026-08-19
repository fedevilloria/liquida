import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import * as argon2 from 'argon2';
import { isEmail } from 'class-validator';

import { AppModule } from '../../app.module';
import { UsersService } from '../../users/users.service';

const logger = new Logger('SuperuserSeed');

/**
 * Obtiene una variable obligatoria sin aceptar valores vacíos.
 */
const requireEnvironmentValue = (
  configService: ConfigService,
  key: string,
): string => {
  const value = configService.get<string>(key);

  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`La variable de entorno ${key} es obligatoria.`);
  }

  return value.trim();
};

/**
 * Crea el superusuario configurado mediante variables de entorno.
 */
async function seedSuperuser(): Promise<void> {
  const applicationContext = await NestFactory.createApplicationContext(
    AppModule,
    {
      logger: ['error', 'warn', 'log'],
    },
  );

  try {
    const configService = applicationContext.get(ConfigService);
    const usersService = applicationContext.get(UsersService);

    const name = requireEnvironmentValue(configService, 'SUPERUSER_NAME');

    const email = requireEnvironmentValue(
      configService,
      'SUPERUSER_EMAIL',
    ).toLowerCase();

    const password = requireEnvironmentValue(
      configService,
      'SUPERUSER_PASSWORD',
    );

    if (name.length < 2 || name.length > 100) {
      throw new Error('SUPERUSER_NAME debe contener entre 2 y 100 caracteres.');
    }

    if (!isEmail(email) || email.length > 254) {
      throw new Error(
        'SUPERUSER_EMAIL debe contener un correo electrónico válido.',
      );
    }

    if (
      password.length < 8 ||
      password.length > 128 ||
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(password)
    ) {
      throw new Error(
        'SUPERUSER_PASSWORD debe contener entre 8 y 128 caracteres e incluir una mayúscula, una minúscula y un número.',
      );
    }

    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
    });

    const result = await usersService.createSuperuserIfMissing({
      name,
      email,
      passwordHash,
    });

    if (result.created) {
      logger.log(
        `Superusuario creado correctamente con el correo ${result.user.email}.`,
      );
    } else {
      logger.log(
        `El superusuario ${result.user.email} ya existía. No se realizaron cambios.`,
      );
    }
  } finally {
    await applicationContext.close();
  }
}

void seedSuperuser().catch((error: unknown) => {
  const message =
    error instanceof Error
      ? error.message
      : 'Ocurrió un error desconocido durante el seed.';

  logger.error(message);
  process.exitCode = 1;
});
