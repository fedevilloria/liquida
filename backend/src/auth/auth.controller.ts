import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
  ApiOkResponse,
} from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { RegisterUserResponseDto } from './dto/register-user-response.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { VerifyEmailResponseDto } from './dto/verify-email-response.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { ResendVerificationResponseDto } from './dto/resend-verification-response.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
}
