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
exports.WashServicesService = void 0;
const common_1 = require("@nestjs/common");
const serialize_1 = require("../common/utils/serialize");
const prisma_service_1 = require("../prisma/prisma.service");
let WashServicesService = class WashServicesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query) {
        const page = query.page ?? 1;
        const pageSize = query.pageSize ?? 10;
        const where = {};
        if (query.keyword?.trim()) {
            where.name = { contains: query.keyword.trim() };
        }
        if (query.enabled === '1') {
            where.enabled = true;
        }
        else if (query.enabled === '0') {
            where.enabled = false;
        }
        const [rows, total] = await Promise.all([
            this.prisma.washService.findMany({
                where,
                skip: (page - 1) * pageSize,
                take: pageSize,
                orderBy: { sort: 'asc' },
            }),
            this.prisma.washService.count({ where }),
        ]);
        return {
            list: rows.map(serialize_1.toWashServiceJson),
            total,
            page,
            pageSize,
        };
    }
    async findOne(id) {
        const row = await this.prisma.washService.findUnique({ where: { id } });
        if (!row) {
            throw new common_1.NotFoundException('服务项目不存在');
        }
        return (0, serialize_1.toWashServiceJson)(row);
    }
    async create(dto) {
        const maxSort = await this.prisma.washService.aggregate({
            _max: { sort: true },
        });
        const row = await this.prisma.washService.create({
            data: {
                code: dto.code ?? null,
                name: dto.name,
                price: dto.price,
                durationMin: dto.durationMin,
                enabled: dto.enabled ?? true,
                sort: dto.sort ?? (maxSort._max.sort ?? 0) + 1,
            },
        });
        return (0, serialize_1.toWashServiceJson)(row);
    }
    async update(id, dto) {
        await this.findOne(id);
        const row = await this.prisma.washService.update({
            where: { id },
            data: {
                ...(dto.code !== undefined && { code: dto.code }),
                ...(dto.name !== undefined && { name: dto.name }),
                ...(dto.price !== undefined && { price: dto.price }),
                ...(dto.durationMin !== undefined && { durationMin: dto.durationMin }),
                ...(dto.enabled !== undefined && { enabled: dto.enabled }),
                ...(dto.sort !== undefined && { sort: dto.sort }),
            },
        });
        return (0, serialize_1.toWashServiceJson)(row);
    }
    async remove(id) {
        await this.findOne(id);
        await this.prisma.washService.delete({ where: { id } });
        return null;
    }
};
exports.WashServicesService = WashServicesService;
exports.WashServicesService = WashServicesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WashServicesService);
//# sourceMappingURL=wash-services.service.js.map