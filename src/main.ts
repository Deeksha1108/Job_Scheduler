import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WinstonLogger } from './logger/winston';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new WinstonLogger(),
  });

  const config = new DocumentBuilder()
    .setTitle('Persistent Job Scheduler')
    .setDescription('API documentation for job scheduler')
    .setVersion('1.0')
    .addTag('booking')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3000;

  await app.listen(port);
  console.log(`Server started on http://localhost:${port}`);
  console.log(`Swagger started on http://localhost:${port}/api`);

  app.enableShutdownHooks();
}
bootstrap();
