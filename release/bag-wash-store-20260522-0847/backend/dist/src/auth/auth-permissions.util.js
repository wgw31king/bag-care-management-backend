"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MANAGER_ROLE = void 0;
exports.resolveStaffPermissions = resolveStaffPermissions;
const enums_1 = require("../common/constants/enums");
exports.MANAGER_ROLE = '店长';
function resolveStaffPermissions(staff) {
    if (!staff) {
        return [];
    }
    if (staff.role === exports.MANAGER_ROLE) {
        return [...enums_1.PERMISSIONS];
    }
    if (!Array.isArray(staff.permissions)) {
        return [];
    }
    return staff.permissions.filter((p) => enums_1.PERMISSIONS.includes(p));
}
//# sourceMappingURL=auth-permissions.util.js.map