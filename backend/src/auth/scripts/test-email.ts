import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { randomBytes } from 'crypto';
import { isEmail } from 'class-validator';

import { AppModule } from '../../app.module';
import { EmailService } from '../email.service';

const logger = new Logger('EmailTest');

/**
 * Comprueba la conexión SMTP y envía un correo real
 * a la dirección recibida desde la terminal.
 */
async function testEmail(): Promise<void> {
  const recipient = process.argv[2];

  if (!recipient || !isEmail(recipient)) {
    throw new Error(
      'Debés indicar un correo válido. Ejemplo: npm run email:test -- usuario@hotmail.com',
    );
  }

  const applicationContext = await NestFactory.createApplicationContext(
    AppModule,
    {
      logger: ['error', 'warn', 'log'],
    },
  );

  try {
    const emailService = applicationContext.get(EmailService);

    await emailService.verifyConnection();

    logger.log('La conexión con el servidor SMTP fue verificada.');

    const testToken = randomBytes(32).toString('hex');

    await emailService.sendEmailVerification(
      recipient,
      'Usuario de prueba',
      testToken,
    );

    logger.log(`Correo de prueba enviado correctamente a ${recipient}.`);
  } finally {
    await applicationContext.close();
  }
}

void testEmail().catch((error: unknown) => {
  const message =
    error instanceof Error
      ? error.message
      : 'Ocurrió un error desconocido durante la prueba de correo.';

  logger.error(message);
  process.exitCode = 1;
});
