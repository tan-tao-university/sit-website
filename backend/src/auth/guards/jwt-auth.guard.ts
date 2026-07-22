import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AccessTokenPayload, AuthenticatedRequest } from '../auth.types';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractBearerToken(request.headers.authorization);

    if (!token) {
      throw new UnauthorizedException('No access token provided');
    }

    try {
      const payload =
        await this.jwtService.verifyAsync<AccessTokenPayload>(token);

      if (payload.type !== 'access' || !payload.sub) {
        throw new UnauthorizedException('Invalid access token');
      }

      const dbUser = await this.authService.getUserById(payload.sub);
      if (!dbUser?.isActive) {
        throw new UnauthorizedException('User is inactive or no longer exists');
      }

      request.user = { ...payload, roles: dbUser.roles || [] };
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }

  private extractBearerToken(value?: string): string | undefined {
    if (!value) return undefined;
    const [type, token] = value.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
