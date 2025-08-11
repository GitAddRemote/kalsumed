import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserService } from '../../user/user.service';
import { OAuthAccount } from '../../../entities/oauth-account.entity';

interface SocialProfile {
  provider: string;
  id: string;
  emails?: { value: string }[];
  name?: { givenName?: string; familyName?: string };
  photos?: { value: string }[];
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
}

@Injectable()
export class OAuthService {
  constructor(
    @InjectRepository(OAuthAccount)
    private readonly oauthRepo: Repository<OAuthAccount>,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Handle OAuth callback: find or create user, persist OAuthAccount, issue JWT cookie
   */
  async handleSocialLogin(profile: SocialProfile, res: Response): Promise<void> {
    const provider = profile.provider;
    const providerUserId = profile.id;

    // 1. Try existing OAuthAccount → user
    let user = await this.userService.findByOAuthAccount(provider, providerUserId);

    // 2. If no OAuth link, try by email or create new user
    if (!user) {
      const email = profile.emails?.[0]?.value;
      if (email) {
        try {
          user = await this.userService.getByEmail(email);
        } catch {
          user = null;
        }
      }
      if (!user) {
        // Create a new user with a random password placeholder
        const username = email?.split('@')[0] ?? `${provider}_${providerUserId}`;
        const randomHash = Math.random().toString(36).slice(-8);
        user = await this.userService.createLocal(username, email ?? '', randomHash);
      }
      // Persist OAuthAccount
      const oa = this.oauthRepo.create({
        user,
        provider,
        providerUserId,
        accessToken: profile.accessToken,
        refreshToken: profile.refreshToken,
        expiresAt: profile.expiresIn
          ? new Date(Date.now() + profile.expiresIn * 1000)
          : undefined,
      });
      await this.oauthRepo.save(oa);
    }

    // 3. Issue JWT
    const payload = { sub: user.id, username: user.username, roles: user.roles.map(r => r.name) };
    const token = this.jwtService.sign(payload);

    // 4. Set cookie
    const secure = this.config.get<string>('NODE_ENV') === 'production';
    res.cookie('Authentication', token, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      maxAge: this.config.get<number>('JWT_EXPIRATION_MS') ?? 15 * 60 * 1000,
    });

    // 5. Redirect or respond
    const redirectUrl = this.config.get<string>('OAUTH_SUCCESS_REDIRECT') ?? '/dashboard';
    res.redirect(redirectUrl);
  }
}