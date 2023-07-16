import { NestFactory } from '@nestjs/core';
import { AdminApiModule } from './admin-api.module';

async function bootstrap() {
  const app = await NestFactory.create(AdminApiModule);
  await app.listen(3000);
}
bootstrap();
