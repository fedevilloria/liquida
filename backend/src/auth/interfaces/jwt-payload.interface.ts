import { UserRole } from '../../users/enums/user-role.enum';

export interface JwtPayload {
  sub: number;
  email: string;
  role: UserRole;
  sessionId: number;
}
