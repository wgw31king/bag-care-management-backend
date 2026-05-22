import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LOGIN_FAILED_MESSAGE } from './auth.constants';
import { isStoreManager } from './auth-manager.util';
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
    const isManager = isStoreManager(user.username, user.staff?.role);
    const payload: JwtPayload = {
      userId: user.id,
      displayName: user.displayName,
      permissions,
      username: user.username,
      role: user.staff?.role,
      isManager,
    };
    const token = await this.jwt.signAsync(payload);
    return {
      token,
      displayName: user.displayName,
      permissions,
      username: user.username,
      role: user.staff?.role,
      isManager,
    };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { staff: true },
    });
    if (!user) {
      throw new UnauthorizedException(LOGIN_FAILED_MESSAGE);
    }
    const isManager = isStoreManager(user.username, user.staff?.role);
    return {
      userId: user.id,
      username: user.username,
      displayName: user.displayName,
      permissions: resolveStaffPermissions(user.staff),
      role: user.staff?.role,
      isManager,
    };
  }

  /** 可切换的在职账号（已绑定登录用户） */
  async listSwitchableUsers() {
    const rows = await this.prisma.staff.findMany({
      where: { status: '在职', user: { isNot: null } },
      include: { user: { select: { username: true } } },
      orderBy: { name: 'asc' },
    });
    return {
      list: rows.map((r) => ({
        staffId: r.id,
        name: r.name,
        username: r.user!.username,
        role: r.role,
      })),
    };
  }
}
