import { Injectable, Logger } from '@nestjs/common';
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

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly emailVerificationService: EmailVerificationService,
    private readonly emailService: EmailService,
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
}
