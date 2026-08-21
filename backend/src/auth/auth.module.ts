import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EmailService } from './email.service';
import { EmailVerificationService } from './email-verification.service';
import { EmailVerificationToken } from './entities/email-verification-token.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EmailVerificationToken]), UsersModule],
  controllers: [AuthController],
  providers: [AuthService, EmailVerificationService, EmailService],
  exports: [EmailVerificationService, EmailService],
})
export class AuthModule {}
