import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import {
  Strategy as AppleStrategyBase,
  AuthenticateOptions,
} from 'passport-apple';
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

type RawProfile = Record<string, unknown>;

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function extractId(p: unknown): string | undefined {
  return isObject(p) && typeof p.id === 'string' ? p.id : undefined;
}

function extractEmails(p: unknown): { value: string }[] | undefined {
  if (!isObject(p) || !Array.isArray(p.emails)) return undefined;
  const out: { value: string }[] = [];
  for (const e of p.emails) {
    if (isObject(e) && typeof e.value === 'string') out.push({ value: e.value });
  }
  return out.length ? out : undefined;
}

function extractName(p: unknown): { givenName?: string; familyName?: string } | undefined {
  if (!isObject(p) || !isObject(p.name)) return undefined;
  const givenName =
    typeof (p.name as RawProfile).givenName === 'string'
      ? (p.name as RawProfile).givenName
      : undefined;
  const familyName =
    typeof (p.name as RawProfile).familyName === 'string'
      ? (p.name as RawProfile).familyName
      : undefined;
  return givenName || familyName ? { givenName, familyName } : undefined;
}

function extractExpiresIn(idToken: unknown): number | undefined {
  if (!isObject(idToken) || typeof (idToken as RawProfile).exp !== 'number') return undefined;
  const exp = (idToken as RawProfile).exp as number; // seconds
  const ms = exp * 1000 - Date.now();
  return ms > 0 ? ms : 0;
}

@Injectable()
export class AppleStrategy extends PassportStrategy(AppleStrategyBase, 'apple') {
  constructor(config: ConfigService) {
    const requireKey = (k: string) => {
      const v = config.get<string>(k);
      if (!v) throw new Error(`Missing config key: ${k}`);
      return v;
    };

    const options: AuthenticateOptions = {
      clientID: requireKey('APPLE_CLIENT_ID'),
      teamID: requireKey('APPLE_TEAM_ID'),
      keyID: requireKey('APPLE_KEY_ID'),
      privateKeyString: requireKey('APPLE_PRIVATE_KEY').replace(/\\n/g, '\n'),
      callbackURL: requireKey('APPLE_CALLBACK_URL'),
      scope: ['name', 'email'],
      passReqToCallback: false,
    };

    super(options);
  }

  // Passport verify callback (Nest can handle returned value)
  validate(
    accessToken: string,
    refreshToken: string,
    idToken: unknown,
    profile: unknown,
  ): AppleProfile {
    const id = extractId(profile);
    if (!id) {
      throw new UnauthorizedException('Invalid Apple profile: missing id');
    }

    const emails = extractEmails(profile);
    const name = extractName(profile);
    const expiresIn = extractExpiresIn(idToken);

    return {
      provider: 'apple',
      id,
      emails,
      name,
      accessToken,
      refreshToken,
      expiresIn,
    };
  }
}
