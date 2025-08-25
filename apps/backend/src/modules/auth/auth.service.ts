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

/** Liberal detector; we normalize email to lowercase before lookup. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Shapes when UserService exposes lookups that throw on not-found. */
type GetByUsernameFn = (username: string) => Promise<User>;
type GetByEmailFn = (email: string) => Promise<User>;

/** Type guard without `any` or unsafe member access. */
function hasGetByUsername(svc: UserService): svc is UserService & { getByUsername: GetByUsernameFn } {
  return typeof (svc as { getByUsername?: unknown }).getByUsername === 'function';
}
function hasGetByEmail(svc: UserService): svc is UserService & { getByEmail: GetByEmailFn } {
  return typeof (svc as { getByEmail?: unknown }).getByEmail === 'function';
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

  /**
   * Validate credentials where `identifier` may be an email OR a username.
   * Returns the user when the password matches; otherwise null.
   */
  async validateUser(identifier: string, plainPassword: string): Promise<User | null> {
    const id = identifier.trim();
    const isEmail = EMAIL_RE.test(id);

    const user = isEmail
      ? await this.getByEmailSafe(id.toLowerCase())
      : await this.getByUsernameSafe(id);

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
    // If/when you add server-side refresh revocation, delete current jti here.
  }

  // ---------- lookup helpers (safe, null-returning) ----------

  private async getByEmailSafe(email: string): Promise<User | null> {
    if (!hasGetByEmail(this.users)) return null;
    try {
      return await this.users.getByEmail(email);
    } catch {
      return null;
    }
  }

  private async getByUsernameSafe(username: string): Promise<User | null> {
    if (!hasGetByUsername(this.users)) return null;
    // If you choose case-insensitive usernames, normalize here.
    try {
      return await this.users.getByUsername(username);
    } catch {
      return null;
    }
  }

  // ---------- tokens ----------

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
    const roles = Array.isArray(user.roles) ? user.roles.map((r) => r.name) : [];
    const accessPayload: JwtAccessPayload = { sub: user.id, roles, type: 'access' };
    const refreshPayload: JwtRefreshPayload = {
      sub: user.id,
      type: 'refresh',
      tokenId: randomUUID(),
    };

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
