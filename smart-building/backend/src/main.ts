import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RolesGuard } from './auth/roles.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: '*', allowedHeaders: '*' }); // Allow frontend to fetch data with custom headers
  app.useGlobalGuards(new RolesGuard());
  await app.listen(process.env.PORT ?? 3001, '0.0.0.0'); // Listen on all network interfaces
}
bootstrap();
