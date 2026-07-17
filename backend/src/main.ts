import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import dns from 'dns';

async function bootstrap() {
  dns.setDefaultResultOrder('ipv4first');
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      'https://finova-ljxx.vercel.app',
      'http://localhost:3000',
      'http://localhost:3001',
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 5000);
}
bootstrap();
