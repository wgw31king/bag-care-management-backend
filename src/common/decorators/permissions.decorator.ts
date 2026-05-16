import { SetMetadata } from '@nestjs/common';
import { Permission } from '../constants/enums';

export const PERMISSIONS_KEY = 'permissions';

/** 满足任一权限即可访问 */
export const RequirePermissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
