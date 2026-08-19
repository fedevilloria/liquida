import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';

import { UsersService } from '../users/users.service';
import { AuthUserResponseDto } from './dto/auth-user-response.dto';
import { RegisterUserDto } from './dto/register-user.dto';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Registra un usuario común.
   *
   * La contraseña se transforma mediante Argon2 antes
   * de enviarse al servicio de usuarios.
   */
  async register(
    registerUserDto: RegisterUserDto,
  ): Promise<AuthUserResponseDto> {
    const passwordHash = await argon2.hash(registerUserDto.password, {
      type: argon2.argon2id,
    });

    const user = await this.usersService.createPendingUser({
      name: registerUserDto.name,
      email: registerUserDto.email,
      passwordHash,
    });

    return AuthUserResponseDto.fromEntity(user);
  }
}
