import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy as GoogleStrategyBase, StrategyOptions } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

export interface GoogleProfile {
  provider: 'google';
  id: string;
  emails?: { value: string }[];
  name?: { givenName?: string; familyName?: string };
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  photos?: { value: string }[];
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
  throw new UnauthorizedException('Google profile missing id');
}

function extractEmails(profile: unknown): { value: string }[] | undefined {
  if (!isObject(profile) || !Array.isArray(profile.emails)) return undefined;
  const list: { value: string }[] = [];
  for (const e of profile.emails) {
    if (isObject(e) && typeof e.value === 'string') list.push({ value: e.value });
  }
  return list.length ? list : undefined;
}

function extractName(profile: unknown): { givenName?: string; familyName?: string } | undefined {
  if (!isObject(profile)) return undefined;
  const raw = (profile as { name?: unknown }).name;
  if (!isObject(raw)) return undefined;

  const obj = raw as Record<string, unknown>;

  const given: string | undefined =
    typeof obj.givenName === 'string'
      ? obj.givenName
      : typeof obj.firstName === 'string'
        ? obj.firstName
        : undefined;

  const family: string | undefined =
    typeof obj.familyName === 'string'
      ? obj.familyName
      : typeof obj.lastName === 'string'
        ? obj.lastName
        : undefined;

  if (!given && !family) return undefined;

  const name: { givenName?: string; familyName?: string } = {};
  if (given) name.givenName = given;
  if (family) name.familyName = family;
  return name;
}

function extractPhotos(profile: unknown): { value: string }[] | undefined {
  if (!isObject(profile) || !Array.isArray(profile.photos)) return undefined;
  const list: { value: string }[] = [];
  for (const p of profile.photos) {
    if (isObject(p) && typeof p.value === 'string') list.push({ value: p.value });
  }
  return list.length ? list : undefined;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(GoogleStrategyBase, 'google') {
  constructor(config: ConfigService) {
    super({
      clientID: requireKey(config, 'GOOGLE_CLIENT_ID'),
      clientSecret: requireKey(config, 'GOOGLE_CLIENT_SECRET'),
      callbackURL: requireKey(config, 'GOOGLE_CALLBACK_URL'),
      scope: ['openid', 'email', 'profile'],
      passReqToCallback: false,
    } as StrategyOptions);
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: unknown,
    done: (err: unknown, user?: GoogleProfile) => void,
  ): void {
    try {
      const id = extractId(profile);
      const emails = extractEmails(profile);
      const name = extractName(profile);
      const photos = extractPhotos(profile);

      const result: GoogleProfile = { provider: 'google', id };
      if (emails) result.emails = emails;
      if (name) result.name = name;
      if (photos) result.photos = photos;
      if (accessToken) result.accessToken = accessToken;
      if (refreshToken) result.refreshToken = refreshToken;
      done(null, result);
    } catch (e) {
      done(e);
    }
  }
}
