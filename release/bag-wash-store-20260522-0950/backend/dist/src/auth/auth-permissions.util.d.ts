import { Permission } from '../common/constants/enums';
export declare const MANAGER_ROLE = "\u5E97\u957F";
export declare function resolveStaffPermissions(staff: {
    role: string;
    permissions: unknown;
} | null | undefined): Permission[];
