import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Permission, PERMISSIONS } from '../common/constants/enums';
import { PrismaService } from '../prisma/prisma.service';
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
      throw new UnauthorizedException('用户名或密码错误');
    }
    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('用户名或密码错误');
    }
    const permissions = this.resolvePermissions(user.staff?.permissions);
    const payload: JwtPayload = {
      sub: user.id,
      displayName: user.displayName,
      permissions,
    };
    const token = await this.jwt.signAsync(payload);
    return { token, displayName: user.displayName };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { staff: true },
    });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    return {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      permissions: this.resolvePermissions(user.staff?.permissions),
    };
  }

  private resolvePermissions(raw: unknown): Permission[] {
    if (!Array.isArray(raw)) {
      return [...PERMISSIONS];
    }
    return raw.filter((p): p is Permission =>
      (PERMISSIONS as readonly string[]).includes(p as string),
    );
  }
}
