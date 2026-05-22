import { ConfigService } from '@nestjs/config';
import { Strategy } from 'passport-jwt';
import { Permission } from '../common/constants/enums';
export interface JwtPayload {
    userId: string;
    displayName: string;
    permissions: Permission[];
    username?: string;
    role?: string;
    isManager?: boolean;
}
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    constructor(config: ConfigService);
    validate(payload: JwtPayload): JwtPayload;
}
export {};
