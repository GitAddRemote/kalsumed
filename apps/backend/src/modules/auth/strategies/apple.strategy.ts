// apps/backend/src/modules/auth/strategies/apple.strategy.ts

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import {
  Strategy as AppleStrategyBase,
  AuthenticateOptions,
} from 'passport-apple';
import { ConfigService } from '@nestjs/config';

// the shape you return from validate()
export interface AppleProfile {
  provider: 'apple';
  id: string;
  emails?: { value: string }[] | undefined;
  name?: { givenName?: string; familyName?: string } | undefined;
  accessToken?: string | undefined;
  refreshToken?: string | undefined;
  expiresIn?: number | undefined;
}

@Injectable()
export class AppleStrategy extends PassportStrategy(
  AppleStrategyBase,
  'apple',
) {
  constructor(config: ConfigService) {
    // Build an options object typed as AuthenticateOptions
    const options: AuthenticateOptions = {
      clientID:           config.get<string>('APPLE_CLIENT_ID')!,
      teamID:             config.get<string>('APPLE_TEAM_ID')!,
      keyID:              config.get<string>('APPLE_KEY_ID')!,
      privateKeyString:   config
                           .get<string>('APPLE_PRIVATE_KEY')!
                           .replace(/\\n/g, '\n'),
      callbackURL:        config.get<string>('APPLE_CALLBACK_URL')!,
      scope:              ['name', 'email'],
      passReqToCallback:  false,   // now satisfies the required property
    };

    // Pass it into super()
    super(options);
  }

  // Return your profile shape directly — Nest will handle the "done" for you
  async validate(
    accessToken: string,
    refreshToken: string,
    idToken: any,
    profile: any,
  ): Promise<AppleProfile> {
    return {
      provider: "apple" as const,
      id: profile.id,
      emails: profile.emails ?? [],
      name: profile.name,
      accessToken,
      refreshToken,
      expiresIn: idToken.exp
        ? Math.max(0, idToken.exp * 1000 - Date.now())
        : undefined,
    };
  }
}
