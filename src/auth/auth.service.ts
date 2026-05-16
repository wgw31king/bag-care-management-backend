import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LOGIN_FAILED_MESSAGE } from './auth.constants';
import { resolveStaffPermissions } from './auth-permissions.util';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { username: dto.username },
      include: { staff: true },
    });
    if (!user) {
      throw new UnauthorizedException(LOGIN_FAILED_MESSAGE);
    }
    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException(LOGIN_FAILED_MESSAGE);
    }
    const permissions = resolveStaffPermissions(user.staff);
    const payload: JwtPayload = {
      userId: user.id,
      displayName: user.displayName,
      permissions,
    };
    const token = await this.jwt.signAsync(payload);
    return { token, displayName: user.displayName, permissions };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { staff: true },
    });
    if (!user) {
      throw new UnauthorizedException(LOGIN_FAILED_MESSAGE);
    }
    return {
      userId: user.id,
      username: user.username,
      displayName: user.displayName,
      permissions: resolveStaffPermissions(user.staff),
    };
  }
}
