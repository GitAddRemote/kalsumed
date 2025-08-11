import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Get required roles set by @Roles() on handler or controller
    const requiredRoles = this.reflector.get<string[]>(
      ROLES_KEY,
      context.getHandler(),
    );
    if (!requiredRoles || requiredRoles.length === 0) {
      // No roles metadata means public or already protected by another guard
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as any;

    if (!user || !Array.isArray(user.roles)) {
      throw new ForbiddenException('User has no roles assigned');
    }

    const hasRole = requiredRoles.some((role) =>
      user.roles.includes(role),
    );

    if (!hasRole) {
      throw new ForbiddenException(
        `User lacks required role: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
