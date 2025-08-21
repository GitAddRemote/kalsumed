import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { JwtPayload } from './interfaces/jwt-payload.interface.js';

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);
  // In production, swap this out for a DB or Redis!
  private readonly refreshTokenStore = new Map<string, string>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  generateAccessToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow<string>('jwt.accessSecret'),
      expiresIn: this.configService.getOrThrow<string>('jwt.accessExpiresIn'),
    });
  }

  generateRefreshToken(payload: JwtPayload): string {
    const token = this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow<string>('jwt.refreshSecret'),
      expiresIn: this.configService.getOrThrow<string>('jwt.refreshExpiresIn'),
    });

    // Hash & store it
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    this.refreshTokenStore.set(payload.sub, hash);
    this.logger.debug(`Stored hash for user ${payload.sub}`);

    return token;
  }

  validateRefreshToken(token: string, userId: string): void {
    try {
      this.jwtService.verify(token, {
        secret: this.configService.getOrThrow<string>('jwt.refreshSecret')
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const hash = crypto.createHash('sha256').update(token).digest('hex');
    const stored = this.refreshTokenStore.get(userId);
    if (stored !== hash) {
      throw new UnauthorizedException('Refresh token revoked or mismatched');
    }
  }

  revokeRefreshToken(userId: string): void {
    this.refreshTokenStore.delete(userId);
  }
}
