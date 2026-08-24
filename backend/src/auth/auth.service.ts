import {
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import * as argon2 from 'argon2';

import { UsersService } from '../users/users.service';
import { EmailService } from './email.service';
import { EmailVerificationService } from './email-verification.service';
import { AuthUserResponseDto } from './dto/auth-user-response.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { RegisterUserResponseDto } from './dto/register-user-response.dto';
import { VerifyEmailResponseDto } from './dto/verify-email-response.dto';
import { UserStatus } from '../users/enums/user-status.enum';
import { ResendVerificationResponseDto } from './dto/resend-verification-response.dto';

import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { SessionMetadata, SessionService } from './session.service';

export interface LoginResult {
  response: LoginResponseDto;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly emailVerificationService: EmailVerificationService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly sessionService: SessionService,
  ) {}

  /**
   * Registra un usuario común y genera su verificación de correo.
   */
  async register(
    registerUserDto: RegisterUserDto,
  ): Promise<RegisterUserResponseDto> {
    const passwordHash = await argon2.hash(registerUserDto.password, {
      type: argon2.argon2id,
    });

    const user = await this.usersService.createPendingUser({
      name: registerUserDto.name,
      email: registerUserDto.email,
      passwordHash,
    });

    const generatedToken =
      await this.emailVerificationService.generateForUser(user);

    let verificationEmailSent = true;

    try {
      await this.emailService.sendEmailVerification(
        user.email,
        user.name,
        generatedToken.plainToken,
      );
    } catch (error: unknown) {
      verificationEmailSent = false;

      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Error desconocido durante el envío.';

      /**
       * Nunca se registra el token, la contraseña
       * ni la contraseña de aplicación SMTP.
       */
      this.logger.error(
        `No se pudo enviar el correo de verificación: ${errorMessage}`,
      );
    }

    return {
      user: AuthUserResponseDto.fromEntity(user),
      verificationEmailSent,
      message: verificationEmailSent
        ? 'La cuenta fue registrada. Revisá tu correo para verificarla.'
        : 'La cuenta fue registrada, pero no pudimos enviar el correo de verificación. Podrás solicitar uno nuevo.',
    };
  }
  /**
   * Verifica el correo y deja la cuenta pendiente
   * de aprobación por el superusuario.
   */
  async verifyEmail(token: string): Promise<VerifyEmailResponseDto> {
    const user = await this.emailVerificationService.verifyToken(token);

    return {
      message:
        'El correo fue verificado correctamente. Tu cuenta está pendiente de aprobación.',
      status: user.status,
      emailVerifiedAt: user.emailVerifiedAt as Date,
    };
  }

  /**
   * Reenvía la verificación únicamente a cuentas que todavía
   * se encuentran pendientes de verificar.
   *
   * La respuesta es siempre la misma para evitar revelar
   * si un correo está registrado.
   */
  async resendEmailVerification(
    email: string,
  ): Promise<ResendVerificationResponseDto> {
    const genericResponse: ResendVerificationResponseDto = {
      message:
        'Si existe una cuenta pendiente de verificación, enviaremos un nuevo correo.',
    };

    const user = await this.usersService.findByEmail(email);

    if (!user || user.status !== UserStatus.PENDING_EMAIL_VERIFICATION) {
      return genericResponse;
    }

    const canResend = await this.emailVerificationService.canResendForUser(
      user.id,
    );

    if (!canResend) {
      return genericResponse;
    }

    const generatedToken =
      await this.emailVerificationService.generateForUser(user);

    try {
      await this.emailService.sendEmailVerification(
        user.email,
        user.name,
        generatedToken.plainToken,
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Error desconocido durante el reenvío.';

      this.logger.error(
        `No se pudo reenviar el correo de verificación: ${errorMessage}`,
      );
    }

    return genericResponse;
  }

  /**
   * Valida las credenciales y crea una sesión.
   */
  async login(
    loginDto: LoginDto,
    metadata: SessionMetadata,
  ): Promise<LoginResult> {
    const user = await this.usersService.findByEmailWithPassword(
      loginDto.email,
    );

    if (!user) {
      throw new UnauthorizedException(
        'El correo o la contraseña son incorrectos.',
      );
    }

    const passwordMatches = await argon2.verify(
      user.passwordHash,
      loginDto.password,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException(
        'El correo o la contraseña son incorrectos.',
      );
    }

    this.validateUserCanLogin(user.status);

    const createdSession = await this.sessionService.createForUser(
      user,
      metadata,
    );

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
      sessionId: createdSession.session.id,
    });

    const expiresIn = this.configService.getOrThrow<number>(
      'JWT_ACCESS_EXPIRES_SECONDS',
    );

    return {
      response: {
        accessToken,
        expiresIn,
        user: AuthUserResponseDto.fromEntity(user),
      },
      refreshToken: createdSession.refreshToken,
      refreshTokenExpiresAt: createdSession.expiresAt,
    };
  }

  /**
   * Solamente las cuentas activas pueden iniciar sesión.
   */
  private validateUserCanLogin(status: UserStatus): void {
    switch (status) {
      case UserStatus.ACTIVE:
        return;

      case UserStatus.PENDING_EMAIL_VERIFICATION:
        throw new ForbiddenException(
          'Debés verificar tu correo antes de iniciar sesión.',
        );

      case UserStatus.PENDING_APPROVAL:
        throw new ForbiddenException('Tu cuenta está pendiente de aprobación.');

      case UserStatus.REJECTED:
        throw new ForbiddenException('La solicitud de acceso fue rechazada.');

      case UserStatus.SUSPENDED:
        throw new ForbiddenException('La cuenta se encuentra suspendida.');
    }
  }

  /**
   * Rota el refresh token y genera un access token nuevo.
   */
  async refresh(
    refreshToken: string,
    metadata: SessionMetadata,
  ): Promise<LoginResult> {
    const rotatedSession = await this.sessionService.rotate(
      refreshToken,
      metadata,
    );

    const accessToken = await this.jwtService.signAsync({
      sub: rotatedSession.user.id,
      email: rotatedSession.user.email,
      role: rotatedSession.user.role,
      sessionId: rotatedSession.session.id,
    });

    const expiresIn = this.configService.getOrThrow<number>(
      'JWT_ACCESS_EXPIRES_SECONDS',
    );

    return {
      response: {
        accessToken,
        expiresIn,
        user: AuthUserResponseDto.fromEntity(rotatedSession.user),
      },
      refreshToken: rotatedSession.refreshToken,
      refreshTokenExpiresAt: rotatedSession.expiresAt,
    };
  }

  /**
   * Revoca la sesión asociada al refresh token.
   */
  async logout(refreshToken?: string): Promise<void> {
    if (!refreshToken) {
      return;
    }

    await this.sessionService.revoke(refreshToken);
  }
}
