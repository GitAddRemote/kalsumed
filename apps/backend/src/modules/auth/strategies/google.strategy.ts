// apps/backend/src/modules/auth/strategies/google.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy as GoogleStrategyBase, StrategyOptions } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

interface GoogleProfilePayload {
  provider: 'google';
  id: string;
  primaryEmail?: string;
  emails?: string[];
  name?: { givenName?: string; familyName?: string };
  avatarUrl?: string;
  avatars?: string[];
  accessToken: string;
  refreshToken?: string;
}

type AnyRecord = Record<string, unknown>;

function isObject(v: unknown): v is AnyRecord {
  return typeof v === 'object' && v !== null;
}

function extractId(p: unknown): string | undefined {
  return isObject(p) && typeof p.id === 'string' ? p.id : undefined;
}

function extractEmails(p: unknown): string[] | undefined {
  if (!isObject(p) || !Array.isArray(p.emails)) return undefined;
  const emails = p.emails
    .map(e => (isObject(e) && typeof e.value === 'string' ? e.value : undefined))
    .filter((e): e is string => typeof e === 'string');
  return emails.length ? emails : undefined;
}

function extractName(p: unknown): { givenName?: string; familyName?: string } | undefined {
  if (!isObject(p) || !isObject(p.name)) return undefined;
  const givenName = typeof (p.name as AnyRecord).givenName === 'string' ? (p.name as AnyRecord).givenName : undefined;
  const familyName = typeof (p.name as AnyRecord).familyName === 'string' ? (p.name as AnyRecord).familyName : undefined;
  return givenName || familyName ? { givenName, familyName } : undefined;
}

function extractPhotos(p: unknown): string[] | undefined {
  if (!isObject(p) || !Array.isArray(p.photos)) return undefined;
  const photos = p.photos
    .map(ph => (isObject(ph) && typeof ph.value === 'string' ? ph.value : undefined))
    .filter((v): v is string => typeof v === 'string');
  return photos.length ? photos : undefined;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(GoogleStrategyBase, 'google') {
  constructor(config: ConfigService) {
    const requireKey = (k: string) => {
      const v = config.get<string>(k);
      if (!v) throw new Error(`Missing config key: ${k}`);
      return v;
    };

    const options: StrategyOptions = {
      clientID: requireKey('GOOGLE_CLIENT_ID'),
      clientSecret: requireKey('GOOGLE_CLIENT_SECRET'),
      callbackURL: requireKey('GOOGLE_CALLBACK_URL'),
      scope: ['profile', 'email'],
      passReqToCallback: false,
    };

    super(options);
  }

  validate(accessToken: string, refreshToken: string, profile: unknown): GoogleProfilePayload {
    const id = extractId(profile);
    if (!id) throw new UnauthorizedException('Invalid Google profile: missing id');

    const emails = extractEmails(profile);
    const name = extractName(profile);
    const photos = extractPhotos(profile);

    return {
      provider: 'google',
      id,
      primaryEmail: emails?.[0],
      emails,
      name,
      avatarUrl: photos?.[0],
      avatars: photos,
      accessToken,
      refreshToken: refreshToken || undefined,
    };
  }
}
