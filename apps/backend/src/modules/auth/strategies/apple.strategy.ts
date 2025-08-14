import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy as AppleStrategyBase, AuthenticateOptions } from 'passport-apple';
import { ConfigService } from '@nestjs/config';

export interface AppleProfile {
  provider: 'apple';
  id: string;
  emails?: { value: string }[];
  name?: { givenName?: string; familyName?: string };
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
}

type AnyRecord = Record<string, unknown>;

function isObject(v: unknown): v is AnyRecord {
  return typeof v === 'object' && v !== null;
}

function requireKey(config: ConfigService, key: string): string {
  const value = config.get<string>(key);
  if (!value) throw new Error(`Missing config key: ${key}`);
  return value;
}

function extractId(profile: unknown): string {
  if (isObject(profile) && typeof profile.id === 'string') return profile.id;
  throw new UnauthorizedException('Apple profile missing id');
}

function extractEmails(profile: unknown): { value: string }[] | undefined {
  if (!isObject(profile) || !Array.isArray((profile as any).emails)) return undefined;
  const out: { value: string }[] = [];
  for (const e of (profile as any).emails) {
    if (isObject(e) && typeof (e as any).value === 'string') out.push({ value: (e as any).value });
  }
  return out.length ? out : undefined;
}

function extractName(profile: unknown): { givenName?: string; familyName?: string } | undefined {
  if (!isObject(profile)) return undefined;
  const raw = (profile as { name?: unknown }).name;
  if (!isObject(raw)) return undefined;

  const rn = raw as {
    givenName?: unknown;
    familyName?: unknown;
    firstName?: unknown;
    lastName?: unknown;
  };

  const name: { givenName?: string; familyName?: string } = {};

  if (typeof rn.givenName === 'string') {
    name.givenName = rn.givenName;
  } else if (typeof rn.firstName === 'string') {
    name.givenName = rn.firstName;
  }

  if (typeof rn.familyName === 'string') {
    name.familyName = rn.familyName;
  } else if (typeof rn.lastName === 'string') {
    name.familyName = rn.lastName;
  }

  return name.givenName || name.familyName ? name : undefined;
}

function extractExpiresIn(idTokenDecoded: unknown): number | undefined {
  if (!isObject(idTokenDecoded)) return undefined;
  const exp = (idTokenDecoded as any).exp;
  if (typeof exp !== 'number') return undefined;
  const msRemaining = exp * 1000 - Date.now();
  return msRemaining > 0 ? Math.floor(msRemaining / 1000) : 0;
}

@Injectable()
export class AppleStrategy extends PassportStrategy(AppleStrategyBase, 'apple') {
  constructor(config: ConfigService) {
    super({
      clientID: requireKey(config, 'APPLE_CLIENT_ID'),
      teamID: requireKey(config, 'APPLE_TEAM_ID'),
      keyID: requireKey(config, 'APPLE_KEY_ID'),
      privateKeyString: requireKey(config, 'APPLE_PRIVATE_KEY').replace(/\\n/g, '\n'),
      callbackURL: requireKey(config, 'APPLE_CALLBACK_URL'),
      scope: ['name', 'email'],
      passReqToCallback: false,
    } as AuthenticateOptions);
  }

  validate(
    accessToken: string,
    refreshToken: string,
    idTokenDecoded: unknown,
    profile: unknown,
  ): AppleProfile {
    const id = extractId(profile);
    const emails = extractEmails(profile);
    const name = extractName(profile);
    const expiresIn = extractExpiresIn(idTokenDecoded);

    const result: AppleProfile = { provider: 'apple', id };
    if (emails) result.emails = emails;
    if (name) result.name = name;
    if (accessToken) result.accessToken = accessToken;
    if (refreshToken) result.refreshToken = refreshToken;
    if (typeof expiresIn === 'number') result.expiresIn = expiresIn;
    return result;
  }
}
