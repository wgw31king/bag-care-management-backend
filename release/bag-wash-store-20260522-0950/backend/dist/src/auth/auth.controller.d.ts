import { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './jwt.strategy';
export declare class AuthController {
    private auth;
    constructor(auth: AuthService);
    login(dto: LoginDto): Promise<{
        token: string;
        displayName: string;
        permissions: ("dashboard" | "order" | "customer" | "service" | "staff")[];
        username: string;
        role: string | undefined;
        isManager: boolean;
    }>;
    logout(): null;
    me(req: Request & {
        user: JwtPayload;
    }): Promise<{
        userId: string;
        username: string;
        displayName: string;
        permissions: ("dashboard" | "order" | "customer" | "service" | "staff")[];
        role: string | undefined;
        isManager: boolean;
    }>;
    switchableUsers(): Promise<{
        list: {
            staffId: string;
            name: string;
            username: string;
            role: string;
        }[];
    }>;
}
