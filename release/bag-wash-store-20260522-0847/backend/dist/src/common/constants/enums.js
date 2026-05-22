"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PERMISSIONS = exports.ASSIGNABLE_PERMISSIONS = exports.STAFF_STATUS = exports.CUSTOMER_TAGS = exports.WASH_SERVICES = exports.ORDER_STATUS = void 0;
exports.ORDER_STATUS = [
    'pending_receive',
    'washing',
    'repairing',
    'finished',
    'wait_pickup',
    'picked_up',
];
exports.WASH_SERVICES = [
    'fine_wash',
    'deep_stain',
    'hardware_polish',
    'color_restore',
    'care',
];
exports.CUSTOMER_TAGS = ['普通', 'VIP', '储值'];
exports.STAFF_STATUS = ['在职', '离职'];
exports.ASSIGNABLE_PERMISSIONS = [
    'dashboard',
    'order',
    'customer',
    'service',
];
exports.PERMISSIONS = [
    ...exports.ASSIGNABLE_PERMISSIONS,
    'staff',
];
//# sourceMappingURL=enums.js.map