import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, timingSafeEqual } from 'crypto';
import { Request } from 'express';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  private readonly expectedHash: Buffer;

  constructor(configService: ConfigService) {
    const configuredHash = configService
      .get<string>('API_ACCESS_KEY_SHA256')
      ?.trim()
      .toLowerCase();

    if (!configuredHash || !/^[a-f0-9]{64}$/.test(configuredHash)) {
      throw new Error('API_ACCESS_KEY_SHA256 must be a SHA-256 hex digest');
    }

    this.expectedHash = Buffer.from(configuredHash, 'hex');
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const providedKey = request.headers['x-api-key'];

    if (typeof providedKey !== 'string') {
      throw new UnauthorizedException('Missing API access key');
    }

    const providedHash = createHash('sha256').update(providedKey).digest();
    if (
      providedHash.length !== this.expectedHash.length ||
      !timingSafeEqual(providedHash, this.expectedHash)
    ) {
      throw new UnauthorizedException('Invalid API access key');
    }

    return true;
  }
}
