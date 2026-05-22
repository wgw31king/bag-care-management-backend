import { CreateWashServiceDto } from './dto/create-wash-service.dto';
import { QueryWashServiceDto } from './dto/query-wash-service.dto';
import { UpdateWashServiceDto } from './dto/update-wash-service.dto';
import { WashServicesService } from './wash-services.service';
export declare class WashServicesController {
    private services;
    constructor(services: WashServicesService);
    findAll(query: QueryWashServiceDto): Promise<{
        list: ({
            id: string;
            name: string;
            sort: number;
            code: string | null;
            price: import("@prisma/client/runtime/library").Decimal;
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
        price: import("@prisma/client/runtime/library").Decimal;
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
        price: import("@prisma/client/runtime/library").Decimal;
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
        price: import("@prisma/client/runtime/library").Decimal;
        durationMin: number;
        enabled: boolean;
    } & {
        code: string | null;
        price: number;
    }>;
    remove(id: string): Promise<null>;
}
