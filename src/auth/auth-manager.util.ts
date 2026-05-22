import { MANAGER_ROLE } from './auth-permissions.util';

export function isStoreManager(
  username: string,
  staffRole?: string | null,
): boolean {
  return username === 'admin' || staffRole === MANAGER_ROLE;
}
