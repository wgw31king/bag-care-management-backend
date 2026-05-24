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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const enums_1 = require("../common/constants/enums");
const order_no_1 = require("../common/utils/order-no");
const serialize_1 = require("../common/utils/serialize");
const customers_service_1 = require("../customers/customers.service");
const prisma_service_1 = require("../prisma/prisma.service");
const NOT_DELETED = { deletedAt: null };
let OrdersService = class OrdersService {
    prisma;
    customers;
    constructor(prisma, customers) {
        this.prisma = prisma;
        this.customers = customers;
    }
    buildListWhere(query) {
        const where = { ...NOT_DELETED };
        if (query.status) {
            where.status = query.status;
        }
        if (query.keyword?.trim()) {
            const kw = query.keyword.trim();
            where.OR = [
                { orderNo: { contains: kw } },
                { customerName: { contains: kw } },
                { phone: { contains: kw } },
                { brand: { contains: kw } },
            ];
        }
        return where;
    }
    async findAll(query) {
        const page = query.page ?? 1;
        const pageSize = query.pageSize ?? 10;
        const where = this.buildListWhere(query);
        const [rows, total] = await Promise.all([
            this.prisma.order.findMany({
                where,
                skip: (page - 1) * pageSize,
                take: pageSize,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.order.count({ where }),
        ]);
        return {
            list: rows.map(serialize_1.toOrderJson),
            total,
            page,
            pageSize,
        };
    }
    async findOne(id) {
        const row = await this.prisma.order.findFirst({
            where: { id, ...NOT_DELETED },
        });
        if (!row) {
            throw new common_1.NotFoundException('订单不存在');
        }
        return (0, serialize_1.toOrderJson)(row);
    }
    async create(dto) {
        const customerId = await this.customers.resolveByPhone({
            phone: dto.phone,
            customerName: dto.customerName,
            wechatNote: dto.wechatNote,
        });
        const row = await this.prisma.order.create({
            data: {
                orderNo: (0, order_no_1.generateOrderNo)(),
                customerName: dto.customerName,
                phone: dto.phone,
                wechatNote: dto.wechatNote ?? '',
                brand: dto.brand,
                style: dto.style,
                color: dto.color,
                material: dto.material,
                defectDesc: dto.defectDesc,
                defectImages: dto.defectImages ?? [],
                washServices: dto.washServices,
                orderTime: dto.orderTime,
                expectPickupTime: dto.expectPickupTime,
                amount: dto.amount,
                prepay: dto.prepay,
                remark: dto.remark ?? '',
                status: dto.status ?? enums_1.ORDER_STATUS[0],
                createdAt: BigInt(Date.now()),
                customerId,
            },
        });
        await this.customers.refreshStatsByPhone(dto.phone);
        return (0, serialize_1.toOrderJson)(row);
    }
    async update(id, dto) {
        const existing = await this.findActiveOrThrow(id);
        const phone = dto.phone ?? existing.phone;
        const customerId = dto.phone
            ? await this.customers.resolveByPhone({
                phone,
                customerName: dto.customerName ?? existing.customerName,
                wechatNote: dto.wechatNote ?? existing.wechatNote,
            })
            : existing.customerId;
        const row = await this.prisma.order.update({
            where: { id },
            data: {
                ...(dto.customerName !== undefined && { customerName: dto.customerName }),
                ...(dto.phone !== undefined && { phone: dto.phone }),
                ...(dto.wechatNote !== undefined && { wechatNote: dto.wechatNote }),
                ...(dto.brand !== undefined && { brand: dto.brand }),
                ...(dto.style !== undefined && { style: dto.style }),
                ...(dto.color !== undefined && { color: dto.color }),
                ...(dto.material !== undefined && { material: dto.material }),
                ...(dto.defectDesc !== undefined && { defectDesc: dto.defectDesc }),
                ...(dto.defectImages !== undefined && {
                    defectImages: dto.defectImages,
                }),
                ...(dto.washServices !== undefined && { washServices: dto.washServices }),
                ...(dto.orderTime !== undefined && { orderTime: dto.orderTime }),
                ...(dto.expectPickupTime !== undefined && {
                    expectPickupTime: dto.expectPickupTime,
                }),
                ...(dto.amount !== undefined && { amount: dto.amount }),
                ...(dto.prepay !== undefined && { prepay: dto.prepay }),
                ...(dto.remark !== undefined && { remark: dto.remark }),
                ...(dto.status !== undefined && { status: dto.status }),
                customerId,
            },
        });
        const phones = new Set([existing.phone, phone]);
        for (const p of phones) {
            await this.customers.refreshStatsByPhone(p);
        }
        return (0, serialize_1.toOrderJson)(row);
    }
    async updateStatus(id, dto) {
        await this.findActiveOrThrow(id);
        const row = await this.prisma.order.update({
            where: { id },
            data: { status: dto.status },
        });
        return (0, serialize_1.toOrderJson)(row);
    }
    async remove(id) {
        const existing = await this.findActiveOrThrow(id);
        await this.prisma.order.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
        await this.customers.refreshStatsByPhone(existing.phone);
        return null;
    }
    async findActiveOrThrow(id) {
        const row = await this.prisma.order.findFirst({
            where: { id, ...NOT_DELETED },
        });
        if (!row) {
            throw new common_1.NotFoundException('订单不存在');
        }
        return row;
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        customers_service_1.CustomersService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map