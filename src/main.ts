import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { initializeConnection } from './data-source';
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';
import { IncomingMessage } from 'http';
import 'dotenv/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { PackageJson } from './common/dto/package';
import { cwd } from 'process';
import { SwaggerConfig } from './config/swagger.config';
import { createWinstonLoggerOptions } from 'src/logger/logger.config';
import { ensureLogDir } from 'src/logger/log-paths';
import { json, urlencoded } from 'express';
import { CustomLoggerService } from './common/utils/logger.service';
import { ROUTES } from './app.routes';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(createWinstonLoggerOptions()),
  });

  ensureLogDir();

  const customLoggerService = app.get(CustomLoggerService);

  const logStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {
    flags: 'a',
  });
  app.use(
    morgan(process.env.MORGAN_FORMAT || 'combined', { stream: logStream }),
  );
  // Razorpay webhook signatures are computed over the exact bytes we received.
  app.use(
    json({
      limit: '10mb',
      verify: (req, _res, buf: Buffer) => {
        (req as IncomingMessage & { rawBody?: Buffer }).rawBody = buf;
      },
    }),
  );
  app.use(urlencoded({ extended: true, limit: '10mb' }));

  app.setGlobalPrefix(ROUTES.API_PREFIX, { exclude: [''] });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;

  const allowedOrigins = configService.get<string>('ALLOWED_ORIGINS')
    ? (configService.get<string>('ALLOWED_ORIGINS') ?? '')
        .split(',')
        .map((origin) => origin.trim())
    : [`http://localhost:${port}`];

  app.enableCors({
    origin: (origin, callback) => {
      // React Native / Expo Go do not send Origin. LAN Expo web does.
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        return callback(null, true);
      }
      if (
        /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)(:\d+)?$/.test(
          origin,
        )
      ) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'X-Api-Key',
      'x-correlation-id',
    ],
    credentials: true,
    optionsSuccessStatus: 200,
    maxAge: 86400,
  });

  const packageJson: PackageJson = JSON.parse(
    fs.readFileSync(path.join(cwd(), 'package.json'), 'utf-8'),
  ) as PackageJson;

  const config = new DocumentBuilder()
    .setTitle('ClearIt API')
    .setDescription(
      [
        packageJson.description || 'ClearIt backend',
        '',
        'Three app surfaces under `/api/v1`:',
        '- **customer** — Customer Mobile (OTP auth)',
        '- **agent** — Agent Mobile (OTP auth + job lifecycle)',
        '- **admin** — Admin Web (email/password)',
        '',
        'Click **Authorize** and paste a Bearer access token from login / verify-otp.',
        'With `OTP_DEMO_MODE=true`, OTPs are logged by the API instead of being SMS’d.',
      ].join('\n'),
    )
    .setVersion(packageJson.version)
    .addServer(`http://localhost:${port}`, 'Local')
    .addTag('health', 'Liveness / readiness')
    .addTag('customer', 'Customer Mobile App')
    .addTag('agent', 'Agent Mobile App')
    .addTag('admin', 'Admin Web')
    .addBearerAuth(SwaggerConfig, 'access-token')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(ROUTES.SWAGGER, app, document, {
    customSiteTitle: 'ClearIt API · Swagger',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
      filter: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      displayRequestDuration: true,
    },
    jsonDocumentUrl: `${ROUTES.SWAGGER}-json`,
  });

  // Friendly alias: /docs → same UI as /api
  SwaggerModule.setup('docs', app, document, {
    customSiteTitle: 'ClearIt API · Swagger',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
      filter: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      displayRequestDuration: true,
    },
  });

  try {
    await initializeConnection();
    customLoggerService.log('Data Source has been initialized!', 'bootstrap');
    await app.listen(port, '0.0.0.0');
    customLoggerService.log(
      `Application is running on: ${await app.getUrl()}`,
      'bootstrap',
    );
  } catch (err) {
    customLoggerService.error(
      'Error during Data Source initialization',
      err instanceof Error ? err.stack : undefined,
      'bootstrap',
    );
    // Still listen so /health can report degraded DB when credentials are missing during setup
    await app.listen(port, '0.0.0.0');
    customLoggerService.warn(
      `App listening on port ${port} without DB (fill .env and restart)`,
      'bootstrap',
    );
  }
}

void bootstrap();
