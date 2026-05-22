"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomersService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let CustomersService = class CustomersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query) {
        const page = query.page ?? 1;
        const pageSize = query.pageSize ?? 10;
        const where = {};
        if (query.tag) {
            where.tag = query.tag;
        }
        if (query.keyword?.trim()) {
            const kw = query.keyword.trim();
            where.OR = [
                { name: { contains: kw } },
                { phone: { contains: kw } },
                { wechat: { contains: kw } },
            ];
        }
        const [list, total] = await Promise.all([
            this.prisma.customer.findMany({
                where,
                skip: (page - 1) * pageSize,
                take: pageSize,
                orderBy: { id: 'desc' },
            }),
            this.prisma.customer.count({ where }),
        ]);
        return { list, total, page, pageSize };
    }
    async findOne(id) {
        const row = await this.prisma.customer.findUnique({ where: { id } });
        if (!row) {
            throw new common_1.NotFoundException('客户不存在');
        }
        return row;
    }
    async create(dto) {
        try {
            return await this.prisma.customer.create({
                data: {
                    name: dto.name,
                    phone: dto.phone,
                    wechat: dto.wechat ?? '',
                    tag: dto.tag ?? '普通',
                    remark: dto.remark ?? '',
                    orderCount: 0,
                },
            });
        }
        catch (e) {
            if (e instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                e.code === 'P2002') {
                throw new common_1.ConflictException('手机号已存在');
            }
            throw e;
        }
    }
    async update(id, dto) {
        await this.findOne(id);
        try {
            return await this.prisma.customer.update({
                where: { id },
                data: {
                    ...(dto.name !== undefined && { name: dto.name }),
                    ...(dto.phone !== undefined && { phone: dto.phone }),
                    ...(dto.wechat !== undefined && { wechat: dto.wechat }),
                    ...(dto.tag !== undefined && { tag: dto.tag }),
                    ...(dto.remark !== undefined && { remark: dto.remark }),
                },
            });
        }
        catch (e) {
            if (e instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                e.code === 'P2002') {
                throw new common_1.ConflictException('手机号已存在');
            }
            throw e;
        }
    }
    async remove(id) {
        await this.findOne(id);
        const linkedOrders = await this.prisma.order.count({
            where: { customerId: id, deletedAt: null },
        });
        if (linkedOrders > 0) {
            throw new common_1.BadRequestException('该客户存在关联订单，无法删除');
        }
        await this.prisma.customer.delete({ where: { id } });
        return null;
    }
    async resolveByPhone(input) {
        const existing = await this.prisma.customer.findUnique({
            where: { phone: input.phone },
        });
        if (existing) {
            return existing.id;
        }
        const created = await this.prisma.customer.create({
            data: {
                name: input.customerName,
                phone: input.phone,
                wechat: input.wechatNote ?? '',
                tag: '普通',
                remark: '',
                orderCount: 0,
            },
        });
        return created.id;
    }
    async refreshStatsByPhone(phone) {
        const customer = await this.prisma.customer.findUnique({ where: { phone } });
        if (!customer) {
            return;
        }
        const orders = await this.prisma.order.findMany({
            where: { phone, deletedAt: null },
            select: { orderTime: true },
            orderBy: { orderTime: 'desc' },
        });
        const orderCount = orders.length;
        let lastVisit = null;
        if (orders.length > 0) {
            lastVisit = orders[0].orderTime.slice(0, 10);
        }
        await this.prisma.customer.update({
            where: { id: customer.id },
            data: { orderCount, lastVisit },
        });
    }
};
exports.CustomersService = CustomersService;
exports.CustomersService = CustomersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CustomersService);
//# sourceMappingURL=customers.service.js.map