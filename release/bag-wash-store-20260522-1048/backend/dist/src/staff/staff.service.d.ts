import { JwtPayload } from '../auth/jwt.strategy';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { QueryStaffDto } from './dto/query-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
export declare class StaffService {
    private prisma;
    constructor(prisma: PrismaService);
    private toJson;
    findAll(query: QueryStaffDto): Promise<{
        list: {
            permissions: string[];
            username: string | null;
            id: string;
            name: string;
            phone: string;
            role: string;
            status: string;
        }[];
        total: number;
        page: number;
        pageSize: number;
    }>;
    findOne(id: string): Promise<{
        permissions: string[];
        username: string | null;
        id: string;
        name: string;
        phone: string;
        role: string;
        status: string;
    }>;
    create(dto: CreateStaffDto): Promise<{
        permissions: string[];
        username: string | null;
        id: string;
        name: string;
        phone: string;
        role: string;
        status: string;
    }>;
    private syncUserAccount;
    update(id: string, dto: UpdateStaffDto, actor?: JwtPayload): Promise<{
        permissions: string[];
        username: string | null;
        id: string;
        name: string;
        phone: string;
        role: string;
        status: string;
    }>;
    remove(id: string): Promise<null>;
}
