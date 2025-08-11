// apps/backend/src/modules/auth/token/token.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { jwtConfig } from '../config/jwt.config';
import { TokenService } from './token.service';
import { TokenController } from './token.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';

@Module({
  imports: [
    // load our jwt namespace, typed + validated
    ConfigModule.forFeature(jwtConfig),
    // configure Passport-JWT via JwtModule
    JwtModule.registerAsync({
      imports: [ConfigModule.forFeature(jwtConfig)],
      inject: [jwtConfig.KEY],
      useFactory: (cfg: ConfigType<typeof jwtConfig>) => ({
        secret: cfg.accessSecret,
        signOptions: { expiresIn: cfg.accessExpiresIn },
      }),
    }),
  ],
  providers: [
    TokenService,
    JwtStrategy,
    RefreshTokenStrategy,
  ],
  controllers: [TokenController],
  exports: [TokenService],
})
export class TokenModule {}
