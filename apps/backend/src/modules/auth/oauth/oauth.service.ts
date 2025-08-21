/**
 * @file apps/backend/src/modules/auth/oauth/oauth.service.ts
 * @summary OAuth service: normalize provider profiles, link/create users, upsert OAuth accounts, and issue JWTs.
 * @module Auth/OAuth/OAuthService
 * @description
 *   - Strict guards around unknown provider profile shapes (no `any`, no unsafe access)
 *   - Uses conditional spreads so optional props are omitted when undefined (compatible with `exactOptionalPropertyTypes`)
 *   - Finds/creates a concrete `User` entity and links it to `OAuthAccount`
 *   - Uses nullish coalescing (`??`) and safe error normalization
 *   - Lint-clean under @typescript-eslint rules (no-unsafe-*, prefer-nullish-coalescing, no-unused-vars)
 * @author
 *   Demian (GitAddRemote)
 * @copyright
 *   (c) 2025 Presstronic Studios LLC
 */

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';

import { User } from '../../user/entities/user.entity.js';
import { UserService } from '../../user/user.service.js';
import { OAuthAccount } from '../entities/oauth-account.entity.js';

/**
 * Minimal provider profile we operate on after normalization.
 * NOTE: With `exactOptionalPropertyTypes`, optional fields must be omitted when undefined.
 */
interface SocialProfile {
  provider: string;
  id: string;
  emails?: { value: string }[];
  name?: { givenName?: string; familyName?: string };
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
}

/** Generic non-null object with string keys. */
type UnknownRecord = Record<string, unknown>;

/** Non-null object guard. */
function isRecord(v: unknown): v is UnknownRecord {
  return typeof v === 'object' && v !== null;
}

/** Safe property getter (returns `unknown`). */
function getProp(obj: unknown, key: string): unknown {
  if (!isRecord(obj)) return undefined;
  return obj[key];
}

/** Safe string getter. */
function getString(obj: unknown, key: string): string | undefined {
  const v = getProp(obj, key);
  return typeof v === 'string' ? v : undefined;
}

/** Safe number getter. */
function getNumber(obj: unknown, key: string): number | undefined {
  const v = getProp(obj, key);
  return typeof v === 'number' ? v : undefined;
}

/** Array guard. */
function isArray(v: unknown): v is unknown[] {
  return Array.isArray(v);
}

/** Extract `{ value: string }[]` emails safely from an unknown profile. */
function extractEmailsArr(profile: unknown): { value: string }[] | undefined {
  const emails = getProp(profile, 'emails');
  if (!isArray(emails)) return undefined;

  const list: { value: string }[] = [];
  for (const item of emails) {
    const val = getString(item, 'value');
    if (val) list.push({ value: val });
  }
  return list.length ? list : undefined;
}

/** Extract given/family name pair from common shapes. */
function extractName(
  profile: unknown,
): { givenName?: string; familyName?: string } | undefined {
  const nameObj = getProp(profile, 'name');
  if (!isRecord(nameObj)) return undefined;

  const givenCandidate =
    getString(nameObj, 'givenName') ?? getString(nameObj, 'firstName');
  const familyCandidate =
    getString(nameObj, 'familyName') ?? getString(nameObj, 'lastName');

  const out: { givenName?: string; familyName?: string } = {};
  if (typeof givenCandidate === 'string') out.givenName = givenCandidate;
  if (typeof familyCandidate === 'string') out.familyName = familyCandidate;

  return out.givenName || out.familyName ? out : undefined;
}

/** Normalize unknown `oauthUser` into a `SocialProfile` (omit undefined props). */
function normalizeUnknownProfile(oauthUser: unknown): SocialProfile {
  const json = getProp(oauthUser, '_json');

  const provider =
    getString(oauthUser, 'provider') ?? getString(json, 'provider');
  const id =
    getString(oauthUser, 'id') ??
    getString(oauthUser, 'sub') ??
    getString(json, 'id') ??
    getString(json, 'sub');

  if (!provider || !id) {
    throw new UnauthorizedException('Invalid OAuth profile: missing provider or id');
  }

  const emails = extractEmailsArr(oauthUser);
  const name = extractName(oauthUser);
  const accessToken = getString(oauthUser, 'accessToken');
  const refreshToken = getString(oauthUser, 'refreshToken');
  const expiresIn = getNumber(oauthUser, 'expiresIn');

  // Build object with conditional spreads so we don't include `prop: undefined`
  const out: SocialProfile = {
    provider,
    id,
    ...(emails ? { emails } : {}),
    ...(name ? { name } : {}),
    ...(accessToken ? { accessToken } : {}),
    ...(refreshToken ? { refreshToken } : {}),
    ...(typeof expiresIn === 'number' ? { expiresIn } : {}),
  };

  return out;
}

/** Safe `email` → local-part extractor. */
function emailLocalPart(email: string | undefined): string | undefined {
  if (!email) return undefined;
  const at = email.indexOf('@');
  return at >= 0 ? email.slice(0, at) : email;
}

/** Normalize unknown errors to `Error` for safe rethrow/reject. */
const asError = (e: unknown, fallback = 'OAuth error'): Error =>
  e instanceof Error ? e : new Error(typeof e === 'string' ? e : fallback);

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
   * Handle OAuth callback: find or create user, persist OAuthAccount, issue JWT cookie, then redirect.
   * Accepts a **trusted SocialProfile** (already shaped by your Passport strategy).
   */
  async handleSocialLogin(profile: SocialProfile, res: Response): Promise<void> {
    const provider = profile.provider;
    const providerUserId = profile.id;

    // 1) Existing OAuthAccount → user
    let user: User | null = await this.userService.findByOAuthAccount(provider, providerUserId);

    // 2) If no OAuth link, try by email or create new user
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
        // Create a new user with a random placeholder password
        const username = emailLocalPart(email) ?? `${provider}_${providerUserId}`;
        const randomHash = Math.random().toString(36).slice(-8);
        user = await this.userService.createLocal(username, email ?? '', randomHash);
      }

      // Persist OAuthAccount
      const { accessToken, refreshToken, expiresIn } = profile;
      const expiresAt =
        typeof expiresIn === 'number' ? new Date(Date.now() + expiresIn * 1000) : undefined;

      const oauthData: Partial<OAuthAccount> = {
        user,
        provider,
        providerUserId,
        ...(accessToken ? { accessToken } : {}),
        ...(refreshToken ? { refreshToken } : {}),
        ...(expiresAt ? { expiresAt } : {}),
      };

      const oa = this.oauthRepo.create(oauthData);
      await this.oauthRepo.save(oa);
    }

    // 3) Issue JWT (cookie)
    const roles = (user.roles ?? []).map((r) => r.name);
    const payload = { sub: user.id, username: user.username, roles };
    const token = this.jwtService.sign(payload);

    // 4) Set cookie securely
    const isProd = this.config.get<string>('NODE_ENV') === 'production';
    const rawMaxAge = this.config.get<string | number>('JWT_EXPIRATION_MS');
    const maxAgeNum = typeof rawMaxAge === 'number' ? rawMaxAge : Number(rawMaxAge ?? 0);
    const maxAge = Number.isFinite(maxAgeNum) && maxAgeNum > 0 ? maxAgeNum : 15 * 60 * 1000;

    res.cookie('Authentication', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      maxAge,
    });

    // 5) Redirect
    const redirectUrl = this.config.get<string>('OAUTH_SUCCESS_REDIRECT') ?? '/dashboard';
    res.redirect(redirectUrl);
  }

  /**
   * Handle OAuth login and return JWT tokens (used by controller callbacks).
   * Accepts **unknown** and normalizes it internally to avoid unsafe access.
   */
  async handleOAuthLogin(oauthUser: unknown): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const profile = normalizeUnknownProfile(oauthUser);
      const provider = profile.provider;
      const providerUserId = profile.id;

      // 1) Existing OAuthAccount → user
      let user: User | null = await this.userService.findByOAuthAccount(provider, providerUserId);

      // 2) If no OAuth link, try by email or create new user
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
          const username = emailLocalPart(email) ?? `${provider}_${providerUserId}`;
          const randomHash = Math.random().toString(36).slice(-8);
          user = await this.userService.createLocal(username, email ?? '', randomHash);
        }

        // Persist OAuthAccount (omit undefined props)
        const { accessToken, refreshToken, expiresIn } = profile;
        const expiresAt =
          typeof expiresIn === 'number' ? new Date(Date.now() + expiresIn * 1000) : undefined;

        const oauthData: Partial<OAuthAccount> = {
          user,
          provider,
          providerUserId,
          ...(accessToken ? { accessToken } : {}),
          ...(refreshToken ? { refreshToken } : {}),
          ...(expiresAt ? { expiresAt } : {}),
        };

        const oa = this.oauthRepo.create(oauthData);
        await this.oauthRepo.save(oa);
      }

      // 3) Generate JWT tokens
      const payload = { sub: user.id, username: user.username, email: user.email ?? undefined };

      const accessToken = this.jwtService.sign(payload, {
        expiresIn: this.config.get<string>('JWT_ACCESS_EXPIRES_IN') ?? '15m',
      });

      const refreshToken = this.jwtService.sign(payload, {
        expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '7d',
      });

      return { accessToken, refreshToken };
    } catch (e: unknown) {
      throw asError(e);
    }
  }
}
