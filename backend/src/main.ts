import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  /**
   * Valida automáticamente los DTO recibidos por los endpoints.
   *
   * whitelist elimina propiedades que no están declaradas en el DTO.
   * forbidNonWhitelisted genera un error si se envían campos desconocidos.
   * transform convierte parámetros como "1" al tipo esperado cuando es posible.
   */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();