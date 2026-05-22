import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWashServiceDto } from './dto/create-wash-service.dto';
import { QueryWashServiceDto } from './dto/query-wash-service.dto';
import { UpdateWashServiceDto } from './dto/update-wash-service.dto';
export declare class WashServicesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(query: QueryWashServiceDto): Promise<{
        list: ({
            id: string;
            name: string;
            sort: number;
            code: string | null;
            price: Prisma.Decimal;
            durationMin: number;
            enabled: boolean;
        } & {
            code: string | null;
            price: number;
        })[];
        total: number;
        page: number;
        pageSize: number;
    }>;
    findOne(id: string): Promise<{
        id: string;
        name: string;
        sort: number;
        code: string | null;
        price: Prisma.Decimal;
        durationMin: number;
        enabled: boolean;
    } & {
        code: string | null;
        price: number;
    }>;
    create(dto: CreateWashServiceDto): Promise<{
        id: string;
        name: string;
        sort: number;
        code: string | null;
        price: Prisma.Decimal;
        durationMin: number;
        enabled: boolean;
    } & {
        code: string | null;
        price: number;
    }>;
    update(id: string, dto: UpdateWashServiceDto): Promise<{
        id: string;
        name: string;
        sort: number;
        code: string | null;
        price: Prisma.Decimal;
        durationMin: number;
        enabled: boolean;
    } & {
        code: string | null;
        price: number;
    }>;
    remove(id: string): Promise<null>;
}
