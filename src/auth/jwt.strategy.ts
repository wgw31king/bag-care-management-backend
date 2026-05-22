import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Permission } from '../common/constants/enums';

export interface JwtPayload {
  userId: string;
  displayName: string;
  permissions: Permission[];
  username?: string;
  role?: string;
  /** 门店管理员：admin 账号或岗位「店长」 */
  isManager?: boolean;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  validate(payload: JwtPayload) {
    if (!payload?.userId) {
      throw new UnauthorizedException('Invalid token');
    }
    return payload;
  }
}
