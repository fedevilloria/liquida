import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  /**
   * Permite leer cookies firmadas o normales
   * desde los controladores y guards.
   */
  app.use(cookieParser());

  const configService = app.get(ConfigService);

  const port = configService.getOrThrow<number>('PORT');

  const frontendUrl = configService.getOrThrow<string>('FRONTEND_URL');

  const swaggerEnabled = configService.getOrThrow<boolean>('SWAGGER_ENABLED');

  /**
   * Valida automáticamente los DTO recibidos
   * por los endpoints.
   *
   * whitelist elimina propiedades no declaradas.
   * forbidNonWhitelisted rechaza campos desconocidos.
   * transform convierte los valores al tipo esperado.
   */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  /**
   * Permite que el futuro frontend Angular
   * consuma la API desde otro origen.
   *
   * El origen permitido se configura mediante
   * la variable FRONTEND_URL.
   */
  app.enableCors({
    origin: frontendUrl,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true,
  });

  /**
   * Swagger puede habilitarse o deshabilitarse
   * mediante la variable SWAGGER_ENABLED.
   */
  if (swaggerEnabled) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Liquida API')
      .setDescription(
        'API REST para la gestión de grupos, bancos y liquidaciones de comisiones.',
      )
      .setVersion('1.0.0')
      .addBearerAuth()
      .build();

    const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);

    SwaggerModule.setup('api/docs', app, swaggerDocument, {
      customSiteTitle: 'Liquida API',
    });
  }

  await app.listen(port);
}

void bootstrap();
