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
exports.StaffService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const enums_1 = require("../common/constants/enums");
const prisma_service_1 = require("../prisma/prisma.service");
let StaffService = class StaffService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    toJson(row, username) {
        const raw = Array.isArray(row.permissions) ? row.permissions : [];
        const permissions = raw.filter((p) => enums_1.ASSIGNABLE_PERMISSIONS.includes(p));
        return {
            ...row,
            permissions,
            username: username ?? null,
        };
    }
    async findAll(query) {
        const page = query.page ?? 1;
        const pageSize = query.pageSize ?? 10;
        const where = {};
        if (query.status) {
            where.status = query.status;
        }
        if (query.keyword?.trim()) {
            const kw = query.keyword.trim();
            where.OR = [
                { name: { contains: kw } },
                { phone: { contains: kw } },
                { role: { contains: kw } },
            ];
        }
        const [rows, total] = await Promise.all([
            this.prisma.staff.findMany({
                where,
                skip: (page - 1) * pageSize,
                take: pageSize,
                orderBy: { id: 'desc' },
                include: { user: { select: { username: true } } },
            }),
            this.prisma.staff.count({ where }),
        ]);
        return {
            list: rows.map((r) => this.toJson(r, r.user?.username)),
            total,
            page,
            pageSize,
        };
    }
    async findOne(id) {
        const row = await this.prisma.staff.findUnique({
            where: { id },
            include: { user: { select: { username: true } } },
        });
        if (!row) {
            throw new common_1.NotFoundException('员工不存在');
        }
        return this.toJson(row, row.user?.username);
    }
    async create(dto) {
        if (dto.username === 'admin') {
            throw new common_1.BadRequestException('不能创建用户名为 admin 的账号');
        }
        if (!dto.username?.trim() || !dto.password) {
            throw new common_1.BadRequestException('新建员工须同时提供登录账号与初始密码');
        }
        try {
            return await this.prisma.$transaction(async (tx) => {
                const row = await tx.staff.create({
                    data: {
                        name: dto.name,
                        phone: dto.phone,
                        role: dto.role,
                        status: dto.status ?? '在职',
                        permissions: dto.permissions,
                    },
                });
                const passwordHash = await bcrypt.hash(dto.password, 10);
                await tx.user.create({
                    data: {
                        username: dto.username.trim(),
                        passwordHash,
                        displayName: dto.name,
                        staffId: row.id,
                    },
                });
                return this.toJson(row, dto.username.trim());
            });
        }
        catch (e) {
            if (e instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                e.code === 'P2002') {
                throw new common_1.ConflictException('手机号或登录账号已存在');
            }
            throw e;
        }
    }
    async syncUserAccount(tx, staffId, staffName, dto, isManager) {
        if (dto.username === 'admin') {
            throw new common_1.BadRequestException('不能创建用户名为 admin 的账号');
        }
        const linked = await tx.user.findUnique({ where: { staffId } });
        if (dto.password && !dto.username) {
            if (!linked) {
                throw new common_1.BadRequestException('该员工尚未开通登录，请同时填写账号与密码');
            }
            if (linked.username === 'admin') {
                throw new common_1.BadRequestException('不能修改管理员密码');
            }
            const passwordHash = await bcrypt.hash(dto.password, 10);
            await tx.user.update({
                where: { id: linked.id },
                data: { passwordHash, displayName: staffName },
            });
            return linked.username;
        }
        if (dto.username && !dto.password && linked && isManager) {
            if (linked.username === 'admin') {
                throw new common_1.BadRequestException('不能修改管理员登录账号');
            }
            await tx.user.update({
                where: { id: linked.id },
                data: { username: dto.username, displayName: staffName },
            });
            return dto.username;
        }
        if ((dto.username && !dto.password) || (!dto.username && dto.password)) {
            throw new common_1.BadRequestException('新建或更换登录账号时 username 与 password 须同时提供');
        }
        if (!dto.username || !dto.password) {
            return linked?.username ?? null;
        }
        const passwordHash = await bcrypt.hash(dto.password, 10);
        if (linked) {
            if (linked.username === 'admin') {
                throw new common_1.BadRequestException('不能修改管理员登录账号');
            }
            await tx.user.update({
                where: { id: linked.id },
                data: {
                    username: dto.username,
                    passwordHash,
                    displayName: staffName,
                },
            });
            return dto.username;
        }
        await tx.user.create({
            data: {
                username: dto.username,
                passwordHash,
                displayName: staffName,
                staffId,
            },
        });
        return dto.username;
    }
    async update(id, dto, actor) {
        await this.findOne(id);
        const isManager = Boolean(actor?.isManager);
        try {
            return await this.prisma.$transaction(async (tx) => {
                const row = await tx.staff.update({
                    where: { id },
                    data: {
                        ...(dto.name !== undefined && { name: dto.name }),
                        ...(dto.phone !== undefined && { phone: dto.phone }),
                        ...(dto.role !== undefined && { role: dto.role }),
                        ...(dto.status !== undefined && { status: dto.status }),
                        ...(dto.permissions !== undefined && {
                            permissions: dto.permissions,
                        }),
                    },
                });
                const username = await this.syncUserAccount(tx, id, dto.name ?? row.name, dto, isManager);
                const user = await tx.user.findUnique({
                    where: { staffId: id },
                    select: { username: true },
                });
                return this.toJson(row, username ?? user?.username ?? null);
            });
        }
        catch (e) {
            if (e instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                e.code === 'P2002') {
                throw new common_1.ConflictException('手机号或登录账号已存在');
            }
            throw e;
        }
    }
    async remove(id) {
        const existing = await this.prisma.staff.findUnique({
            where: { id },
            include: { user: true },
        });
        if (!existing) {
            throw new common_1.NotFoundException('员工不存在');
        }
        if (existing.user?.username === 'admin') {
            throw new common_1.BadRequestException('不能删除管理员关联员工');
        }
        await this.prisma.$transaction([
            this.prisma.user.deleteMany({ where: { staffId: id } }),
            this.prisma.staff.delete({ where: { id } }),
        ]);
        return null;
    }
};
exports.StaffService = StaffService;
exports.StaffService = StaffService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StaffService);
//# sourceMappingURL=staff.service.js.map