import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { join } from 'path';
import * as express from 'express';
import * as dotenv from 'dotenv';
import * as bodyParser from 'body-parser';
import { ValidationPipe } from '@nestjs/common';
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Add global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

  // CORS Configuration
  const allowedOrigins = [
    'http://localhost:5173', // Local development
    'http://localhost:3000',
    'https://cruizr-frontend.vercel.app', // Production frontend
    process.env.FRONTEND_URL, // Dynamic frontend URL from env
  ].filter(Boolean); // Remove undefined values

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.includes(origin) ||
        process.env.NODE_ENV === 'development'
      ) {
        callback(null, true);
      } else {
        console.log(`🚫 CORS blocked origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  console.log(`🌐 CORS enabled for origins:`, allowedOrigins);

  // Servește fișierele din uploads - path absolut pentru Render Persistent Disk
  const uploadsPath = process.env.NODE_ENV === 'production' 
    ? '/opt/render/project/src/uploads'  // Render Persistent Disk mount path
    : join(__dirname, '..', '..', 'uploads'); // Local development
  
  app.use('/uploads', express.static(uploadsPath));
  console.log(`📁 Serving static uploads from: ${uploadsPath}`);
  console.log(`📁 __dirname is: ${__dirname}`);
  console.log(`📁 Environment: ${process.env.NODE_ENV || 'development'}`);

  const config = new DocumentBuilder()
    .setTitle('AutoMatch API')
    .setDescription('API pentru aplicația de dating auto')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Application is running on: http://0.0.0.0:${port}`);
}
bootstrap();
