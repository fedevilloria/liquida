import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { AuthUserResponseDto } from './dto/auth-user-response.dto';
import { RegisterUserDto } from './dto/register-user.dto';

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
    type: AuthUserResponseDto,
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
  ): Promise<AuthUserResponseDto> {
    return this.authService.register(registerUserDto);
  }
}
