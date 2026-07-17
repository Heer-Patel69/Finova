import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { FinovaController } from './finova.controller';
import { AiCoachController } from './ai-coach.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'TEMP_SECRET_KEY',
      signOptions: { expiresIn: '60d' },
    }),
  ],
  controllers: [AppController, FinovaController, AiCoachController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
