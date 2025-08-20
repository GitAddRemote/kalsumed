/**
 * @file apps/backend/src/modules/auth/token/token.module.ts
 * @summary Token module wiring for JWT configuration and token services.
 * @module Auth/Tokens/TokenModule
 * @description
 *   Registers `JwtModule` with configuration from the `jwt` namespace and
 *   exposes `TokenService` and `TokenController` for login/refresh/logout flows.
 *   Removes unnecessary `async` from the factory to satisfy `require-await` rule.
 * @author
 *   Demian (GitAddRemote)
 * @copyright
 *   (c) 2025 Presstronic Studios LLC
 */

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TokenController } from './token.controller';
import { TokenService } from './token.service';
import { AuthModule } from '../auth.module';

@Module({
  imports: [
    AuthModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      // ✅ Not async: there is nothing to await; satisfies `require-await`
      useFactory: (config: ConfigService) => ({
        // Using keys from registerAs('jwt', ...) (e.g. jwt.accessSecret)
        secret: config.getOrThrow<string>('jwt.accessSecret'),
        signOptions: {
          expiresIn: config.get<string>('jwt.accessExpiresIn') ?? '15m',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [TokenController],
  providers: [TokenService],
  exports: [TokenService],
})
export class TokenModule {
  /**
   * @class TokenModule
   * @classdesc Encapsulates token-related configuration and providers,
   *   including JWT signing options derived from the `jwt` config namespace.
   */
}
