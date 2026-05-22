import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { JwtPayload } from '../../auth/jwt.strategy';

/** 仅门店管理员：登录用户名为 admin，或员工岗位为「店长」 */
@Injectable()
export class ManagerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<{ user?: JwtPayload }>();
    if (!req.user?.isManager) {
      throw new ForbiddenException('仅门店管理员可管理员工');
    }
    return true;
  }
}
