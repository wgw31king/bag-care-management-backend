"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isStoreManager = isStoreManager;
const auth_permissions_util_1 = require("./auth-permissions.util");
function isStoreManager(username, staffRole) {
    return username === 'admin' || staffRole === auth_permissions_util_1.MANAGER_ROLE;
}
//# sourceMappingURL=auth-manager.util.js.map