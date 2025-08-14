import { Injectable, BadRequestException } from '@nestjs/common';
import { Response, Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes } from 'node:crypto';
import { User } from '../../user/entities/user.entity';
import { UserService } from '../../user/user.service';
import { OAuthAccount } from '../entities/oauth-account.entity';

interface SocialProfile {
  provider: string;
  id: string;
  emails?: { value: string }[];
  name?: { givenName?: string; familyName?: string };
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface AppleCallbackParams {
  req: Request;
  res: Response;
  code?: string;
  idToken?: string;
  state?: string;
  rawUser?: string;
  issueTokens: (user: User) => Promise<unknown>;
}

@Injectable()
export class OAuthService {
  constructor(
    @InjectRepository(OAuthAccount)
    private readonly oauthRepo: Repository<OAuthAccount>,
    private readonly users: UserService,
    private readonly config: ConfigService,
  ) {}

  initiateGoogle(res: Response): void {
    const clientId = this.config.get<string>('GOOGLE_CLIENT_ID');
    const redirectUri = this.config.get<string>('GOOGLE_REDIRECT_URI');
    if (!clientId || !redirectUri) throw new BadRequestException('Google OAuth not configured');
    const state = this.generateState();
    const scope = encodeURIComponent('openid email profile');
    const url =
      'https://accounts.google.com/o/oauth2/v2/auth' +
      `?client_id=${encodeURIComponent(clientId)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      '&response_type=code' +
      `&scope=${scope}` +
      `&state=${state}`;
    res.redirect(url);
  }

  async handleGoogleCallback(profile: SocialProfile): Promise<User> {
    return this.upsertUser(profile);
  }

  initiateGithub(res: Response): void {
    const clientId = this.config.get<string>('GITHUB_CLIENT_ID');
    const redirectUri = this.config.get<string>('GITHUB_REDIRECT_URI');
    if (!clientId || !redirectUri) throw new BadRequestException('GitHub OAuth not configured');
    const state = this.generateState();
    const url =
      'https://github.com/login/oauth/authorize' +
      `?client_id=${encodeURIComponent(clientId)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      '&scope=read:user user:email' +
      `&state=${state}`;
    res.redirect(url);
  }

  async handleGithubCallback(profile: SocialProfile): Promise<User> {
    return this.upsertUser(profile);
  }

  initiateApple(res: Response): void {
    const clientId = this.config.get<string>('APPLE_CLIENT_ID');
    const redirectUri = this.config.get<string>('APPLE_REDIRECT_URI');
    if (!clientId || !redirectUri) throw new BadRequestException('Apple OAuth not configured');
    const state = this.generateState();
    const url =
      'https://appleid.apple.com/auth/authorize' +
      `?client_id=${encodeURIComponent(clientId)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      '&response_type=code%20id_token' +
      '&response_mode=form_post' +
      '&scope=name%20email' +
      `&state=${state}`;
    res.redirect(url);
  }

  async handleAppleCallback(params: AppleCallbackParams): Promise<unknown> {
    const { rawUser, idToken, code, issueTokens } = params;
    let email: string | undefined;
    let givenName: string | undefined;
    let familyName: string | undefined;

    if (rawUser) {
      try {
        const parsed = JSON.parse(rawUser);
        email = typeof parsed.email === 'string' ? parsed.email : undefined;
        givenName = typeof parsed.name?.firstName === 'string' ? parsed.name.firstName : undefined;
        familyName = typeof parsed.name?.lastName === 'string' ? parsed.name.lastName : undefined;
      } catch {
        /* ignore */
      }
    }

    const name =
      givenName || familyName
        ? {
          ...(givenName && { givenName }),
          ...(familyName && { familyName }),
        }
        : undefined;

    const synthetic: SocialProfile = {
      provider: 'apple',
      id: idToken || code || this.generateState(),
      ...(email && { emails: [{ value: email }] }),
      ...(name && { name }),
    };

    const user = await this.upsertUser(synthetic);
    return issueTokens(user);
  }

  finish(res: Response, tokens: AuthTokens): Response {
    const secure = this.config.get<string>('NODE_ENV') === 'production';
    res.cookie('access_token', tokens.accessToken, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });
    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    const redirectUrl = this.config.get<string>('OAUTH_SUCCESS_REDIRECT') ?? '/';
    res.redirect(redirectUrl);
    return res;
  }

  async unlink(userId: string, provider: string): Promise<void> {
    await this.oauthRepo
      .createQueryBuilder()
      .delete()
      .where('userId = :userId AND provider = :provider', { userId, provider })
      .execute();
  }

  private async upsertUser(profile: SocialProfile): Promise<User> {
    const { provider, id: providerUserId, emails, accessToken, refreshToken, expiresIn } = profile;
    let user = await this.users.findByOAuthAccount(provider, providerUserId);

    if (!user) {
      const primaryEmail = emails?.[0]?.value;
      if (primaryEmail) {
        try {
          user = await this.users.getByEmail(primaryEmail);
        } catch {
          user = null;
        }
      }
      if (!user) {
        const username =
          primaryEmail?.split('@')[0] ??
          `${provider}_${providerUserId}`.toLowerCase();
        const placeholder = randomBytes(12).toString('hex');
        user = await this.users.createLocal(username, primaryEmail ?? '', placeholder);
      }
      const expiresAt = expiresIn ? new Date(Date.now() + expiresIn * 1000) : undefined;
      const oauthAccount = this.oauthRepo.create({
        user,
        provider,
        providerUserId,
        ...(accessToken && { accessToken }),
        ...(refreshToken && { refreshToken }),
        ...(expiresAt && { expiresAt }),
      });
      await this.oauthRepo.save(oauthAccount);
    }
    return user;
  }

  private generateState(): string {
    return randomBytes(16).toString('hex');
  }
}
