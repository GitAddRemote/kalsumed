import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'node:crypto';
import { UserService } from '../user/user.service.js';
import { User } from '../user/entities/user.entity.js';

interface JwtAccessPayload {
  sub: string;
  roles: string[];
  type: 'access';
}

interface JwtRefreshPayload {
  sub: string;
  type: 'refresh';
  tokenId: string;
}

export interface AuthTokensDto {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UserService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  private getRequired(key: string): string {
    const v = this.config.get<string>(key);
    if (!v) throw new Error(`Missing config: ${key}`);
    return v;
  }

  async validateUser(email: string, plainPassword: string): Promise<User | null> {
    let user: User | null;
    try {
      user = await this.users.getByEmail(email);
    } catch {
      user = null;
    }
    if (!user) return null;
    const matches = await bcrypt.compare(plainPassword, user.passwordHash);
    return matches ? user : null;
  }

  async login(user: User): Promise<AuthTokensDto> {
    return this.issueTokens(user, true);
  }

  async refresh(refreshToken: string): Promise<AuthTokensDto> {
    const payload = await this.verifyRefreshToken(refreshToken);
    const user = await this.users.getById(payload.sub);
    if (!user) throw new UnauthorizedException('User not found');
    return this.issueTokens(user, true);
  }

  logout(): void {
    // Implement refresh token revocation if stored.
  }

  private async verifyRefreshToken(token: string): Promise<JwtRefreshPayload> {
    const secret = this.getRequired('JWT_REFRESH_SECRET');
    let decoded: JwtRefreshPayload;
    try {
      decoded = await this.jwt.verifyAsync<JwtRefreshPayload>(token, { secret });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
    if (decoded.type !== 'refresh') throw new UnauthorizedException('Invalid token type');
    return decoded;
  }

  private async issueTokens(user: User, rotateRefresh: boolean): Promise<AuthTokensDto> {
    const roles = user.roles ? user.roles.map(r => r.name) : [];
    const accessPayload: JwtAccessPayload = { sub: user.id, roles, type: 'access' };
    const refreshPayload: JwtRefreshPayload = { sub: user.id, type: 'refresh', tokenId: randomUUID() };

    const accessSecret = this.getRequired('JWT_ACCESS_SECRET');
    const refreshSecret = this.getRequired('JWT_REFRESH_SECRET');
    const accessExp = this.config.get<string>('JWT_ACCESS_EXPIRES') ?? '15m';
    const refreshExp = this.config.get<string>('JWT_REFRESH_EXPIRES') ?? '30d';

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(accessPayload, { secret: accessSecret, expiresIn: accessExp }),
      rotateRefresh
        ? this.jwt.signAsync(refreshPayload, { secret: refreshSecret, expiresIn: refreshExp })
        : Promise.resolve(''),
    ]);

    return { accessToken, refreshToken };
  }
}
