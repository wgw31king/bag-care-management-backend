"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient();
const PERMISSIONS = [
    'dashboard',
    'order',
    'customer',
    'service',
    'staff',
];
const ADMIN_PHONE = '13907511716';
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin';
async function main() {
    await prisma.order.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.washService.deleteMany();
    await prisma.user.deleteMany();
    await prisma.staff.deleteMany();
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    const staff = await prisma.staff.create({
        data: {
            name: '刘亮',
            phone: ADMIN_PHONE,
            role: '店长',
            status: '在职',
            permissions: [...PERMISSIONS],
        },
    });
    await prisma.user.create({
        data: {
            username: ADMIN_USERNAME,
            passwordHash,
            displayName: '刘亮',
            staffId: staff.id,
        },
    });
    console.log('Seed 完成：仅管理员 刘亮');
    console.log(`  登录账号：${ADMIN_USERNAME}`);
    console.log(`  登录密码：${ADMIN_PASSWORD}`);
    console.log(`  手机：${ADMIN_PHONE}`);
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=seed.js.map