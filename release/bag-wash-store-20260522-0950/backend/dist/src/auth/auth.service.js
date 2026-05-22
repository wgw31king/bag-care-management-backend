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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
const prisma_service_1 = require("../prisma/prisma.service");
const auth_constants_1 = require("./auth.constants");
const auth_manager_util_1 = require("./auth-manager.util");
const auth_permissions_util_1 = require("./auth-permissions.util");
let AuthService = class AuthService {
    prisma;
    jwt;
    constructor(prisma, jwt) {
        this.prisma = prisma;
        this.jwt = jwt;
    }
    async login(dto) {
        const user = await this.prisma.user.findUnique({
            where: { username: dto.username },
            include: { staff: true },
        });
        if (!user) {
            throw new common_1.UnauthorizedException(auth_constants_1.LOGIN_FAILED_MESSAGE);
        }
        const ok = await bcrypt.compare(dto.password, user.passwordHash);
        if (!ok) {
            throw new common_1.UnauthorizedException(auth_constants_1.LOGIN_FAILED_MESSAGE);
        }
        const permissions = (0, auth_permissions_util_1.resolveStaffPermissions)(user.staff);
        const isManager = (0, auth_manager_util_1.isStoreManager)(user.username, user.staff?.role);
        const payload = {
            userId: user.id,
            displayName: user.displayName,
            permissions,
            username: user.username,
            role: user.staff?.role,
            isManager,
        };
        const token = await this.jwt.signAsync(payload);
        return {
            token,
            displayName: user.displayName,
            permissions,
            username: user.username,
            role: user.staff?.role,
            isManager,
        };
    }
    async me(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { staff: true },
        });
        if (!user) {
            throw new common_1.UnauthorizedException(auth_constants_1.LOGIN_FAILED_MESSAGE);
        }
        const isManager = (0, auth_manager_util_1.isStoreManager)(user.username, user.staff?.role);
        return {
            userId: user.id,
            username: user.username,
            displayName: user.displayName,
            permissions: (0, auth_permissions_util_1.resolveStaffPermissions)(user.staff),
            role: user.staff?.role,
            isManager,
        };
    }
    async listSwitchableUsers() {
        const rows = await this.prisma.staff.findMany({
            where: { status: '在职', user: { isNot: null } },
            include: { user: { select: { username: true } } },
            orderBy: { name: 'asc' },
        });
        return {
            list: rows.map((r) => ({
                staffId: r.id,
                name: r.name,
                username: r.user.username,
                role: r.role,
            })),
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map