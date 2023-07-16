import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerCustomOptions, SwaggerModule } from '@nestjs/swagger';

import * as cookieParser from 'cookie-parser';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  app.use(cookieParser());

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  const config = new DocumentBuilder()
    .setTitle('Agora RESTFul API')
    .setDescription('Agora endpoints')
    .setVersion('1.0')
    .build();
  const customOptions: SwaggerCustomOptions = {
    swaggerOptions: {
      plugins: {
        statePlugins: {
          spec: { wrapSelectors: { allowTryItOutFor: () => () => false } },
        },
      },
    },
  };
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('agoraDoc', app, document, customOptions);

  // app.enableCors({
  //   origin: ['http://localhost:3000'],
  //   methods: ['GET','PUT','PATCH','POST','DELETE'],
  // });
  app.enableCors();
  await app.listen(process.env.PORT);
  logger.log(`App running on port ${ process.env.PORT }`);
}
bootstrap();
