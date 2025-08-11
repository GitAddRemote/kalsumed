// apps/backend/src/modules/auth/guards/jwt-auth.guard.ts

import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  /**
   * Optionally, you can add extra checks here (e.g. request logging)
   */
  override canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    // call AuthGuard('jwt') which will validate the JWT
    return super.canActivate(context);
  }

  /**
   * Override to throw a cleaner exception when authentication fails
   */
  override handleRequest(err: any, user: any, info: any) {
    // err is any error thrown by the strategy
    // user is the validated payload (or null)
    // info is additional info (e.g. TokenExpiredError)
    if (err) {
      throw err;
    }
    if (!user) {
      // you could inspect `info` to give more context (e.g. token expired)
      throw new UnauthorizedException('Invalid or missing authentication token');
    }
    return user;
  }
}
