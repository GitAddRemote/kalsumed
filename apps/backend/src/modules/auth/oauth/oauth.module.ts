import { Module } from '@nestjs/common';
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
import {AuthModule} from "../auth.module.js";

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ session: false }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (cfg: ConfigService) => ({
        secret: cfg.getOrThrow<string>('JWT_ACCESS_SECRET'), // ✅ Returns string, not string | undefined
        signOptions: { expiresIn: '15m' },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([OAuthAccount, User]),
    UserModule,
    AuthModule,
  ],
  controllers: [OAuthController],
  providers: [
    OAuthService,
    GoogleStrategy,
    AppleStrategy,
  ],
  exports: [OAuthService],
})
export class OAuthModule {}
