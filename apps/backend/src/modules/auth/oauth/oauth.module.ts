import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { OAuthController } from './oauth.controller';
import { OAuthService } from './oauth.service';
import { OAuthAccount } from '../entities/oauth-account.entity';
import { User } from '../../user/entities/user.entity';
import { GoogleStrategy } from '../strategies/google.strategy';
import { AppleStrategy } from '../strategies/apple.strategy';
import { UserModule } from 'src/modules/user/user.module';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ session: false }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (cfg: ConfigService) => ({
        secret: cfg.getOrThrow<string>('JWT_SECRET'), // ✅ Returns string, not string | undefined
        signOptions: { expiresIn: '15m' },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([OAuthAccount, User]),
    UserModule, // <-- This is needed for UserService injection
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