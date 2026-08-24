import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EmailService } from './email.service';
import { EmailVerificationService } from './email-verification.service';
import { EmailVerificationToken } from './entities/email-verification-token.entity';
import { UserSession } from './entities/user-session.entity';
import { SessionService } from './session.service';

import { PassportModule } from '@nestjs/passport';

import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([EmailVerificationToken, UserSession]),
    PassportModule,

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: configService.getOrThrow<number>(
            'JWT_ACCESS_EXPIRES_SECONDS',
          ),
        },
      }),
    }),

    UsersModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    EmailVerificationService,
    EmailService,
    SessionService,
    JwtStrategy,
    JwtAuthGuard,
  ],
  exports: [
    JwtModule,
    EmailVerificationService,
    EmailService,
    SessionService,
    JwtAuthGuard,
  ],
})
export class AuthModule {}
