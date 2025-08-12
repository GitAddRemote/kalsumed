// apps/backend/src/modules/auth/guards/jwt-auth.guard.ts

import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

// Define proper types for better type safety
interface JwtPayload {
  sub: string;
  username: string;
  email?: string;
  iat?: number;
  exp?: number;
}

interface AuthInfo {
  name?: string;
  message?: string;
}

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
  override handleRequest<TUser = JwtPayload>(
    err: Error | null,
    user: JwtPayload | null,
    info: AuthInfo | null,
    context: ExecutionContext,
    status?: number,
  ): TUser {
    if (err) {
      throw err;
    }
    if (!user) {
      throw new UnauthorizedException('Invalid or missing authentication token');
    }
    return user as unknown as TUser;
  }
}
