// apps/backend/src/common/guards/roles.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

interface Role {
  name: string;
}
interface UserRole {
  role: Role;
}
interface UserWithRoles {
  userRoles: UserRole[];
}

type RequestWithUser = {
  user?: unknown;
};

function isUserWithRoles(user: unknown): user is UserWithRoles {
  if (!user || typeof user !== 'object') return false;
  const candidate = user as Partial<UserWithRoles>;
  if (!Array.isArray(candidate.userRoles)) return false;
  return candidate.userRoles.every((ur): ur is UserRole => {
    if (!ur || typeof ur !== 'object') return false;
    const role = (ur as { role?: unknown }).role;
    return (
      !!role &&
      typeof role === 'object' &&
      typeof (role as { name?: unknown }).name === 'string'
    );
  });
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles =
      this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? [];

    if (requiredRoles.length === 0) return true;

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const { user } = request;

    if (!isUserWithRoles(user)) {
      throw new ForbiddenException('User has no roles assigned');
    }

    const userRoleNames = user.userRoles.map((ur) => ur.role.name);
    const hasRole = requiredRoles.some((r) => userRoleNames.includes(r));

    if (!hasRole) {
      throw new ForbiddenException(
        `User lacks required role: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
