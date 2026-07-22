import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { UPLOADS_DIR } from './upload/upload.service';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe, Logger, RequestMethod } from '@nestjs/common';
import { Request, Response, NextFunction, json, urlencoded } from 'express';
import compression from 'compression';
import helmet from 'helmet';
import { randomUUID } from 'crypto';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Serve locally-uploaded images at /uploads (bypasses the api/v1 prefix)
  app.useStaticAssets(UPLOADS_DIR, { prefix: '/uploads' });

  // Increase payload size limit to handle large requests (e.g., large section content)
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  // Security: Add helmet for security headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
      crossOriginEmbedderPolicy: false, // Allow embedding for Swagger UI
      // Allow the frontends (different origins) to load /uploads images
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  // Performance: Enable compression for all responses
  app.use(compression());

  // Request logging with correlation ID
  app.use((req: Request, res: Response, next: NextFunction) => {
    const correlationId = randomUUID();
    req['correlationId'] = correlationId;
    res.setHeader('X-Correlation-ID', correlationId);

    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.log(
        `[${correlationId}] ${req.method} ${req.url} ${res.statusCode} - ${duration}ms`,
      );
    });

    next();
  });

  // Request timeout (30 seconds)
  app.use((req: Request, res: Response, next: NextFunction) => {
    req.setTimeout(30000, () => {
      logger.warn(`Request timeout: ${req.method} ${req.url}`);
      res.status(408).json({
        statusCode: 408,
        message: 'Request Timeout',
        error: 'The request took too long to process',
      });
    });
    next();
  });

  // Enable CORS. Extra origins come from the ORIGIN env var (comma-separated).
  const extraOrigins = (process.env.ORIGIN ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:4000', ...extraOrigins],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Global API prefix
  app.setGlobalPrefix('api/v1', {
    exclude: [{ path: '', method: RequestMethod.GET }],
  });

  // Global validation pipe with detailed error messages
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      errorHttpStatusCode: 422,
    }),
  );

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('SIT Curriculum Management API')
    .setDescription(
      'Private REST API for the School of Information Technology website. Every request requires a service API key; protected operations also require a user JWT.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description:
          'Short-lived access token returned by POST /api/v1/auth/login',
      },
      'bearer-auth',
    )
    .addApiKey(
      {
        type: 'apiKey',
        in: 'header',
        name: 'X-API-Key',
        description: 'Private service-to-service API access key',
      },
      'api-key',
    )
    .addSecurityRequirements('api-key')
    .addTag('system', 'API status and documentation discovery')
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management endpoints (Admin only)')
    .addTag('programs', 'Program management endpoints')
    .addTag('curriculums', 'Curriculum management endpoints')
    .addTag('sections', 'Curriculum section management endpoints')
    .addTag('alumni', 'Alumni management endpoints')
    .addTag('alumni-sections', 'Alumni Section management endpoints')
    .addTag('courses', 'Course management endpoints')
    .addTag('news', 'News management endpoints')
    .addTag('research', 'Research management endpoints')
    .addTag('achievements', 'Achievements management endpoints')
    .addTag('faculty', 'Faculty member management endpoints')
    .addTag('events', 'Event management endpoints')
    .addTag(
      'career-opportunities',
      'Internship and employment opportunity management endpoints',
    )
    .addTag('popup-banners', 'Entry popup banner management endpoints')
    .addTag('search', 'Global public search endpoints')
    .addTag('translation', 'Vietnamese and English translation endpoints')
    .addTag('upload', 'Authenticated file upload endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'SIT API Documentation',
    swaggerOptions: {
      displayRequestDuration: true,
      filter: true,
      persistAuthorization: true,
    },
  });

  const port = process.env.PORT ?? 8080;
  await app.listen(port);

  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`Swagger docs available at: http://localhost:${port}/api/docs`);
  logger.log('Security headers enabled (helmet)');
  logger.log('Response compression enabled');
  logger.log('Request timeout set to 30 seconds');
  logger.log('Correlation ID tracking enabled');
}
bootstrap();
