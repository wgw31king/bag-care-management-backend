import { Permission, PERMISSIONS } from '../common/constants/enums';

/** 店长角色拥有全部权限 */
export const MANAGER_ROLE = '店长';

export function resolveStaffPermissions(
  staff: { role: string; permissions: unknown } | null | undefined,
): Permission[] {
  if (!staff) {
    return [];
  }
  if (staff.role === MANAGER_ROLE) {
    return [...PERMISSIONS];
  }
  if (!Array.isArray(staff.permissions)) {
    return [];
  }
  return staff.permissions.filter((p): p is Permission =>
    (PERMISSIONS as readonly string[]).includes(p as string),
  );
}
