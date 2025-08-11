import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import {
  Strategy,
  ExtractJwt,
  StrategyOptionsWithoutRequest,
} from 'passport-jwt';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private readonly configService: ConfigService,
  ) {
    // 1) Get refresh secret using getOrThrow for automatic error handling
    const refreshSecret = configService.getOrThrow<string>('jwt.refreshSecret');

    // 2) Build options, typed as StrategyOptionsWithoutRequest
    const options: StrategyOptionsWithoutRequest = {
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey: refreshSecret,
    };

    // 3) Call super with the correctly typed options
    super(options);
  }

  validate(payload: JwtPayload) {
    // You could also check a stored/hashed refresh token here
    return { userId: payload.sub };
  }
}