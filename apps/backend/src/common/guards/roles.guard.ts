import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

// Type guard function (like instanceof in Java)
function isUserWithRoles(
  user,
): user is { userRoles: Array<{ role: { name: string } }> } {
  return (
    user &&
    Array.isArray(user.userRoles) &&
    user.userRoles.every((ur) => ur.role && typeof ur.role.name === 'string')
  );
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(
      ROLES_KEY,
      context.getHandler(),
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // No cast!

    // Runtime type checking (like instanceof)
    if (!isUserWithRoles(user)) {
      throw new ForbiddenException('User has no roles assigned');
    }

    // Now TypeScript knows the shape of user
    const userRoleNames = user.userRoles.map((ur) => ur.role.name);
    const hasRole = requiredRoles.some((role) => userRoleNames.includes(role));

    if (!hasRole) {
      throw new ForbiddenException(
        `User lacks required role: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
