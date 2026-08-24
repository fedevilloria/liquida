import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { User } from '../../users/entities/user.entity';
import { UserStatus } from '../../users/enums/user-status.enum';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { SessionService } from '../session.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly sessionService: SessionService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
    });
  }

  /**
   * Se ejecuta después de validar la firma y el vencimiento del JWT.
   *
   * Además, comprueba que la sesión almacenada en PostgreSQL
   * continúe activa y que la cuenta siga habilitada.
   */
  async validate(payload: JwtPayload): Promise<User> {
    const session = await this.sessionService.findActiveSession(
      payload.sessionId,
      payload.sub,
    );

    if (!session) {
      throw new UnauthorizedException(
        'La sesión no existe, venció o fue revocada.',
      );
    }

    if (session.user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('La cuenta no se encuentra habilitada.');
    }

    return session.user;
  }
}
