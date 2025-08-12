import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { Logger, LogLevel, ValidationPipe } from '@nestjs/common';
import cors from 'cors';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { ApiKeyGuard } from './common/guards/api-key.guard';

dotenv.config();

const host = process.env.HOST || '127.0.0.1';
const port = process.env.PORT || 3000;

const logLevels = (process.env.LOG_LEVEL?.split(',') as LogLevel[]) || [
  'log',
  'error',
  'warn',
];

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');
  app.useLogger(logLevels);
  app.use(cookieParser());

  const apiKeyGuard = app.get(ApiKeyGuard);
  app.useGlobalGuards(apiKeyGuard);

  app.use(
    cors({
      credentials: true,
      methods: 'GET,POST,PUT,DELETE,PATCH',
      allowedHeaders: 'Content-Type,Authorization',
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setDescription('API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .addApiKey(
      { type: 'apiKey', name: 'x-api-key', in: 'header' },
      'ApiKeyAuth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  document.security = [{ ApiKeyAuth: [] }];

  SwaggerModule.setup('api/v1/docs', app, document);

  await app.listen(port, host).then(() => {
    Logger.log(`http://${host}:${port}/api/v1 - server start`);
    Logger.log(`http://${host}:${port}/api/v1/docs - swagger start`);
  });
}
bootstrap();