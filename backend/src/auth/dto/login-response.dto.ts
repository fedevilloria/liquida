import { ApiProperty } from '@nestjs/swagger';

import { AuthUserResponseDto } from './auth-user-response.dto';

export class LoginResponseDto {
  @ApiProperty({
    description: 'Access token JWT de corta duración.',
  })
  accessToken!: string;

  @ApiProperty({
    description: 'Duración del access token en segundos.',
    example: 900,
  })
  expiresIn!: number;

  @ApiProperty({
    type: AuthUserResponseDto,
  })
  user!: AuthUserResponseDto;
}
