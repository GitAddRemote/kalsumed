/**
 * @file apps/backend/src/modules/auth/oauth/oauth.module.ts
 * @summary Conditionally registers OAuth providers (Google/Apple) so missing keys don’t crash bootstrap.
 * @description
 *  - If OAUTH_GOOGLE_ENABLED=true OR all GOOGLE_* keys exist, GoogleStrategy is registered.
 *  - If OAUTH_APPLE_ENABLED=true OR all APPLE_* keys exist, AppleStrategy is registered.
 *  - Keeps OAuth controller/service wired while gracefully skipping strategies that aren’t configured.
 * @author
 *   Demian (GitAddRemote)
 * @copyright
 *   (c) 2025 Presstronic Studios LLC
 */

import { DynamicModule, Module, Provider } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { OAuthController } from './oauth.controller.js';
import { OAuthService } from './oauth.service.js';
import { OAuthAccount } from '../entities/oauth-account.entity.js';
import { User } from '../../user/entities/user.entity.js';
import { GoogleStrategy } from '../strategies/google.strategy.js';
import { AppleStrategy } from '../strategies/apple.strategy.js';
import { UserModule } from '../../user/user.module.js';
import { AuthModule } from '../auth.module.js';

function hasAll(keys: string[]): boolean {
  return keys.every((k) => !!process.env[k] && String(process.env[k]).length > 0);
}

function enabledByFlag(flagEnv: string | undefined): boolean {
  return (flagEnv ?? '').toLowerCase() === 'true';
}

@Module({})
export class OAuthModule {
  static register(): DynamicModule {
    // Decide at module-registration time so misconfigured providers aren’t constructed.
    const googleEnabled =
      enabledByFlag(process.env.OAUTH_GOOGLE_ENABLED) ||
      hasAll(['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_CALLBACK_URL']);

    const appleEnabled =
      enabledByFlag(process.env.OAUTH_APPLE_ENABLED) ||
      hasAll(['APPLE_CLIENT_ID', 'APPLE_TEAM_ID', 'APPLE_KEY_ID', 'APPLE_PRIVATE_KEY', 'APPLE_CALLBACK_URL']);

    const strategyProviders: Provider[] = [];
    if (googleEnabled) strategyProviders.push(GoogleStrategy);
    if (appleEnabled) strategyProviders.push(AppleStrategy);

    return {
      module: OAuthModule,
      imports: [
        ConfigModule,
        PassportModule.register({ session: false }),
        JwtModule.registerAsync({
          imports: [ConfigModule],
          useFactory: (cfg: ConfigService) => ({
            secret: cfg.getOrThrow<string>('JWT_ACCESS_SECRET'),
            signOptions: { expiresIn: '15m' },
          }),
          inject: [ConfigService],
        }),
        TypeOrmModule.forFeature([OAuthAccount, User]),
        UserModule,
        AuthModule,
      ],
      controllers: [OAuthController],
      providers: [OAuthService, ...strategyProviders],
      exports: [OAuthService],
    };
  }
}
