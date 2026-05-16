import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Permission } from '../constants/enums';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { JwtPayload } from '../../auth/jwt.strategy';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!required?.length) {
      return true;
    }
    const req = context.switchToHttp().getRequest<{ user?: JwtPayload }>();
    const userPerms = req.user?.permissions ?? [];
    const ok = required.some((p) => userPerms.includes(p));
    if (!ok) {
      throw new ForbiddenException('无权限访问该资源');
    }
    return true;
  }
}
