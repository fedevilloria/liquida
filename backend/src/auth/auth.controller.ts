import {
  Body,
  Controller,
  Get,
  Post,
  HttpCode,
  HttpStatus,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
  ApiOkResponse,
  ApiNoContentResponse,
  ApiUnauthorizedResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { RegisterUserResponseDto } from './dto/register-user-response.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { VerifyEmailResponseDto } from './dto/verify-email-response.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { ResendVerificationResponseDto } from './dto/resend-verification-response.dto';

import { ConfigService } from '@nestjs/config';
import type { CookieOptions, Request, Response } from 'express';

import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';

import { AuthUserResponseDto } from './dto/auth-user-response.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { AuthenticatedRequest } from './interfaces/authenticated-request.interface';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Registra una nueva cuenta común.
   *
   * POST /auth/register
   */
  @ApiOperation({
    summary: 'Registrar una cuenta',
    description:
      'Crea una cuenta común pendiente de verificación del correo electrónico.',
  })
  @ApiCreatedResponse({
    description: 'La cuenta fue registrada correctamente.',
    type: RegisterUserResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Los datos enviados no cumplen las validaciones.',
  })
  @ApiConflictResponse({
    description: 'El correo electrónico ya se encuentra registrado.',
  })
  @Post('register')
  register(
    @Body() registerUserDto: RegisterUserDto,
  ): Promise<RegisterUserResponseDto> {
    return this.authService.register(registerUserDto);
  }

  @ApiOperation({
    summary: 'Verificar un correo electrónico',
    description:
      'Consume el token recibido por correo y deja la cuenta pendiente de aprobación.',
  })
  @ApiOkResponse({
    description: 'El correo fue verificado correctamente.',
    type: VerifyEmailResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'El token es inválido, venció o ya fue utilizado.',
  })
  @HttpCode(HttpStatus.OK)
  @Post('verify-email')
  verifyEmail(
    @Body() verifyEmailDto: VerifyEmailDto,
  ): Promise<VerifyEmailResponseDto> {
    return this.authService.verifyEmail(verifyEmailDto.token);
  }

  @ApiOperation({
    summary: 'Reenviar el correo de verificación',
    description:
      'Genera un nuevo enlace para una cuenta pendiente de verificar.',
  })
  @ApiOkResponse({
    description:
      'La solicitud de reenvío fue procesada con una respuesta neutral.',
    type: ResendVerificationResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'El correo enviado no tiene un formato válido.',
  })
  @HttpCode(HttpStatus.OK)
  @Post('resend-verification')
  resendVerification(
    @Body() resendVerificationDto: ResendVerificationDto,
  ): Promise<ResendVerificationResponseDto> {
    return this.authService.resendEmailVerification(
      resendVerificationDto.email,
    );
  }

  @ApiOperation({
    summary: 'Iniciar sesión',
  })
  @ApiOkResponse({
    description: 'La sesión fue iniciada correctamente.',
    type: LoginResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Los datos enviados no son válidos.',
  })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<LoginResponseDto> {
    const result = await this.authService.login(loginDto, {
      userAgent: request.get('user-agent'),
      ipAddress: request.ip,
    });

    this.setRefreshTokenCookie(
      response,
      result.refreshToken,
      result.refreshTokenExpiresAt,
    );

    return result.response;
  }

  @ApiOperation({
    summary: 'Renovar una sesión',
    description:
      'Rota el refresh token almacenado en la cookie y devuelve un access token nuevo.',
  })
  @ApiOkResponse({
    description: 'La sesión fue renovada correctamente.',
    type: LoginResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'La sesión es inválida, fue revocada o venció.',
  })
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<LoginResponseDto> {
    const refreshToken = this.getRefreshTokenCookie(request);

    if (!refreshToken) {
      throw new UnauthorizedException('No se encontró una sesión renovable.');
    }

    const result = await this.authService.refresh(refreshToken, {
      userAgent: request.get('user-agent'),
      ipAddress: request.ip,
    });

    this.setRefreshTokenCookie(
      response,
      result.refreshToken,
      result.refreshTokenExpiresAt,
    );

    return result.response;
  }

  @ApiOperation({
    summary: 'Cerrar sesión',
    description: 'Revoca el refresh token actual y elimina su cookie.',
  })
  @ApiNoContentResponse({
    description: 'La sesión fue cerrada correctamente.',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('logout')
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    const refreshToken = this.getRefreshTokenCookie(request);

    await this.authService.logout(refreshToken);

    const cookieName = this.configService.getOrThrow<string>(
      'AUTH_REFRESH_COOKIE_NAME',
    );

    response.clearCookie(cookieName, this.getRefreshCookieOptions());
  }

  @ApiOperation({
    summary: 'Consultar el usuario autenticado',
    description:
      'Devuelve los datos públicos del usuario asociado al access token.',
  })
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Usuario autenticado obtenido correctamente.',
    type: AuthUserResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'El access token o la sesión no son válidos.',
  })
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getAuthenticatedUser(
    @Req() request: AuthenticatedRequest,
  ): AuthUserResponseDto {
    return AuthUserResponseDto.fromEntity(request.user);
  }

  /**
   * Guarda el refresh token en una cookie HttpOnly.
   */
  private setRefreshTokenCookie(
    response: Response,
    refreshToken: string,
    expiresAt: Date,
  ): void {
    const cookieName = this.configService.getOrThrow<string>(
      'AUTH_REFRESH_COOKIE_NAME',
    );

    response.cookie(
      cookieName,
      refreshToken,
      this.getRefreshCookieOptions(expiresAt),
    );
  }

  /**
   * Lee la cookie sin confiar directamente en el tipo any
   * proporcionado por cookie-parser.
   */
  private getRefreshTokenCookie(request: Request): string | undefined {
    const cookieName = this.configService.getOrThrow<string>(
      'AUTH_REFRESH_COOKIE_NAME',
    );

    const cookies = request.cookies as unknown;

    if (
      typeof cookies !== 'object' ||
      cookies === null ||
      !(cookieName in cookies)
    ) {
      return undefined;
    }

    const cookieValue = (cookies as Record<string, unknown>)[cookieName];

    return typeof cookieValue === 'string' ? cookieValue : undefined;
  }

  /**
   * Mantiene la misma configuración al crear y eliminar la cookie.
   */
  private getRefreshCookieOptions(expires?: Date): CookieOptions {
    const nodeEnvironment = this.configService.getOrThrow<string>('NODE_ENV');

    return {
      httpOnly: true,
      secure: nodeEnvironment === 'production',
      sameSite: 'lax',
      path: '/auth',
      ...(expires ? { expires } : {}),
    };
  }
}
