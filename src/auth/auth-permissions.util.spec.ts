import { PERMISSIONS } from '../common/constants/enums';
import { resolveStaffPermissions } from './auth-permissions.util';

describe('resolveStaffPermissions', () => {
  it('returns all permissions for 店长', () => {
    expect(
      resolveStaffPermissions({
        role: '店长',
        permissions: ['dashboard'],
      }),
    ).toEqual([...PERMISSIONS]);
  });

  it('returns filtered permissions for non-manager staff', () => {
    expect(
      resolveStaffPermissions({
        role: '洗护技师',
        permissions: ['dashboard', 'order', 'invalid'],
      }),
    ).toEqual(['dashboard', 'order']);
  });

  it('returns empty array when staff is missing', () => {
    expect(resolveStaffPermissions(null)).toEqual([]);
    expect(resolveStaffPermissions(undefined)).toEqual([]);
  });

  it('returns empty array when permissions is not an array', () => {
    expect(
      resolveStaffPermissions({ role: '前台', permissions: 'dashboard' }),
    ).toEqual([]);
  });
});
