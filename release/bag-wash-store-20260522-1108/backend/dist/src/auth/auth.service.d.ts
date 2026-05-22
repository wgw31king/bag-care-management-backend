import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private prisma;
    private jwt;
    constructor(prisma: PrismaService, jwt: JwtService);
    login(dto: LoginDto): Promise<{
        token: string;
        displayName: string;
        permissions: ("dashboard" | "order" | "customer" | "service" | "staff")[];
        username: string;
        role: string | undefined;
        isManager: boolean;
    }>;
    me(userId: string): Promise<{
        userId: string;
        username: string;
        displayName: string;
        permissions: ("dashboard" | "order" | "customer" | "service" | "staff")[];
        role: string | undefined;
        isManager: boolean;
    }>;
    listSwitchableUsers(): Promise<{
        list: {
            staffId: string;
            name: string;
            username: string;
            role: string;
        }[];
    }>;
}
