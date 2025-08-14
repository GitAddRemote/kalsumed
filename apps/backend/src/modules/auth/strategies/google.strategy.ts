import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import {
  Strategy as GoogleStrategyBase,
  StrategyOptions,
} from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { User } from '../../modules/user/entities/user.entity';

export interface GoogleProfile {
  provider: 'google';
  id: string;
  emails?: { value: string }[];
  name?: { givenName?: string; familyName?: string };
  photos?: { value: string }[];
  accessToken?: string;
  refreshToken?: string;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(
  GoogleStrategyBase,
  'google',
) {
  constructor(config: ConfigService) {
    const options: StrategyOptions = {
      clientID: config.get<string>('GOOGLE_CLIENT_ID')!,
      clientSecret: config.get<string>('GOOGLE_CLIENT_SECRET')!,
      callbackURL: config.get<string>('GOOGLE_CALLBACK_URL')!,
      scope: ['email', 'profile'],
      passReqToCallback: false,   // satisfies the required property
    };
    super(options);
  }

  /**
   * This method is called by Passport after Google has authenticated the user.
   * Returning a value here makes Nest automatically call done(null, returnedValue).
   */
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
  ): Promise<GoogleProfile> {
    return {
      provider: 'google',
      id: profile.id,
      emails: profile.emails,
      name: profile.name,
      photos: profile.photos,
      accessToken,
      refreshToken,
    };
  }
}
