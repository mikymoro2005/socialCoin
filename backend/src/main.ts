import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  // Configurazione globale della validazione
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  
  // Configurazione CORS
  app.enableCors({
    origin: '*', // In produzione, specificare domini consentiti
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  
  // Configurazione Swagger
  const config = new DocumentBuilder()
    .setTitle('SocialCoin API')
    .setDescription('API per la piattaforma SocialCoin')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  
  // Prefisso globale per le API
  app.setGlobalPrefix('api');
  
  const port = configService.get<number>('PORT', 3001);
  // Ascolta su tutte le interfacce di rete (0.0.0.0) invece che solo su localhost
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: http://localhost:${port}/api`);
  console.log(`Server is also accessible at: http://192.168.5.24:${port}/api`);
  console.log(`Swagger documentation available at: http://localhost:${port}/api/docs`);
}
bootstrap();
