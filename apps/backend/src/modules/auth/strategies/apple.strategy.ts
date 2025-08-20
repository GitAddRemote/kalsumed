/**
 * @file apps/backend/src/modules/auth/strategies/apple.strategy.ts
 * @summary Apple OAuth Passport strategy for NestJS with strict, safe runtime guards
 *          and zero `any`/unsafe member access or unnecessary type assertions.
 * @module Auth/Strategies/AppleStrategy
 * @author Demian (GitAddRemote)
 * @copyright (c) 2025 Presstronic Studios
 */

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy as AppleStrategyBase } from 'passport-apple';
import { ConfigService } from '@nestjs/config';

/**
 * Public Apple profile shape exposed by this strategy.
 */
export interface AppleProfile {
  provider: 'apple';
  id: string;
  emails?: { value: string }[];
  name?: { givenName?: string; familyName?: string };
  accessToken?: string;
  refreshToken?: string;
  /**
   * Seconds remaining until the ID token expires (0 if already expired).
   */
  expiresIn?: number;
}

/** Narrow type for generic object records. */
type UnknownRecord = Record<string, unknown>;

/** Runtime check for non-null object with string index signature. */
function isRecord(v: unknown): v is UnknownRecord {
  return typeof v === 'object' && v !== null;
}

/** Get a string property from an unknown object safely. */
function getString(obj: unknown, key: string): string | undefined {
  if (!isRecord(obj)) return undefined;
  const v = obj[key];
  return typeof v === 'string' ? v : undefined;
}

/** Get a number property from an unknown object safely. */
function getNumber(obj: unknown, key: string): number | undefined {
  if (!isRecord(obj)) return undefined;
  const v = obj[key];
  return typeof v === 'number' ? v : undefined;
}

/** Get a required configuration value or throw with a helpful message. */
function requireKey(config: ConfigService, key: string): string {
  const value = config.get<string>(key);
  if (!value) throw new Error(`Missing config key: ${key}`);
  return value;
}

/**
 * Extract a stable string `id` from an unknown profile.
 * @throws UnauthorizedException if the id is missing or not a string.
 */
function extractId(profile: unknown): string {
  const id = getString(profile, 'id');
  if (id) return id;
  throw new UnauthorizedException('Apple profile missing id');
}

/**
 * Extract an optional list of email objects `{ value: string }` from an unknown profile.
 * Returns `undefined` if `emails` is absent or not a valid array with string values.
 */
function extractEmails(profile: unknown): { value: string }[] | undefined {
  if (!isRecord(profile)) return undefined;
  const rawEmails = profile.emails;
  if (!Array.isArray(rawEmails)) return undefined;

  const out: { value: string }[] = [];
  for (const item of rawEmails) {
    const value = getString(item, 'value');
    if (value) out.push({ value });
  }
  return out.length ? out : undefined;
}

/**
 * Extract an optional human name from profile.
 * Accepts both { givenName, familyName } and { firstName, lastName } shapes.
 */
function extractName(
  profile: unknown,
): { givenName?: string; familyName?: string } | undefined {
  if (!isRecord(profile)) return undefined;
  const rawName = profile.name;
  if (!isRecord(rawName)) return undefined;

  const givenName = getString(rawName, 'givenName') ?? getString(rawName, 'firstName');
  const familyName = getString(rawName, 'familyName') ?? getString(rawName, 'lastName');

  if (!givenName && !familyName) return undefined;

  const name: { givenName?: string; familyName?: string } = {};
  if (givenName) name.givenName = givenName;
  if (familyName) name.familyName = familyName;
  return name;
}

/**
 * Extract remaining lifetime in seconds from an ID token payload (decoded).
 * Returns `undefined` if `exp` is missing/invalid; returns `0` if already expired.
 */
function extractExpiresIn(idTokenDecoded: unknown): number | undefined {
  const exp = getNumber(idTokenDecoded, 'exp');
  if (typeof exp !== 'number') return undefined;

  const msRemaining = exp * 1000 - Date.now();
  return msRemaining > 0 ? Math.floor(msRemaining / 1000) : 0;
}

/**
 * Apple OAuth strategy for NestJS using `passport-apple`.
 * Ensures configuration values are present and applies strict runtime guards
 * during `validate` to avoid unsafe property access.
 */
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
    });
  }

  /**
   * Passport validate callback.
   * @param accessToken OAuth access token.
   * @param refreshToken OAuth refresh token.
   * @param idTokenDecoded Decoded ID token payload (unknown shape at compile time).
   * @param profile Provider profile (unknown shape at compile time).
   * @returns A normalized `AppleProfile` used by the application.
   */
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
