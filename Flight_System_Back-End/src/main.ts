import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import {config} from 'dotenv';
import * as bodyParser from 'body-parser';
import helmet from 'helmet';
import { LanguageInterceptor } from './common/interceptors/language.interceptor';
import { ValidationExceptionFilter } from './common/pipes/validation_exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule,{cors:true});
  const configService = app.get(ConfigService);
  //========================================================================================
  app.useGlobalInterceptors(new LanguageInterceptor());
  //========================================================================================
  app.useGlobalFilters(new ValidationExceptionFilter())
  //========================================================================================
  config();
  //========================================================================================
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  //========================================================================================
  app.use(cookieParser());
  //========================================================================================
  app.use(helmet());
  //========================================================================================
  const upload =multer();
  app.use((req, res, next) => {
    if(req.is('multipart/form-data')){
      upload.any()(req, res, (err) => {
        if (err) {
          return next(err);
        }
        next();
      });
    } else {
      next();
    }
  });
  //========================================================================================
   app.enableCors({
  origin: [
    'http://localhost:3000',
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'lang',
    'language',
    'Accept',
  ],
  exposedHeaders: [
    'Set-Cookie',
    'Authorization',
    'lang',
  ],
  credentials: true,
});
  //========================================================================================
  //JSON & URL-encoded  زيادة الحد الأقصى لحجم
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
  const swaggerConfig = new DocumentBuilder()
    .setTitle('NEST JS API -Flight API')
    .setDescription(
      'API documentation for Flight management and tracking system for Syria project',
    )
    .addServer(configService.get<string>('DOMAIN') || 'http://localhost:3000')
    .setTermsOfService('https://www.google.com')
    .setLicense('MIT License', 'https://www.google.com')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'bearer',
    )
    .build();
  //========================================================================================
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('swagger', app, document);
  const port = configService.get<string>('PORT') || 3000;
  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
