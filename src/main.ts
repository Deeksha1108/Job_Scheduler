import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WinstonLogger } from './logger/winston';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new WinstonLogger(),
  });

  const port = process.env.PORT || 3000;

  await app.listen(port);
  console.log(`Server started on http://localhost:${port}`);

  app.enableShutdownHooks();
}
bootstrap();
