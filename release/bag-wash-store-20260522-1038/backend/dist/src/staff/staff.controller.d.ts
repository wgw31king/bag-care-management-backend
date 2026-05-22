import { Request } from 'express';
import { JwtPayload } from '../auth/jwt.strategy';
import { CreateStaffDto } from './dto/create-staff.dto';
import { QueryStaffDto } from './dto/query-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { StaffService } from './staff.service';
export declare class StaffController {
    private staff;
    constructor(staff: StaffService);
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
    update(id: string, dto: UpdateStaffDto, req: Request & {
        user: JwtPayload;
    }): Promise<{
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
