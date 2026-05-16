import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { PERMISSIONS } from '../common/constants/enums';
import { PrismaService } from '../prisma/prisma.service';
import { LOGIN_FAILED_MESSAGE } from './auth.constants';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: {
    user: {
      findUnique: jest.Mock;
    };
  };
  let jwt: { signAsync: jest.Mock };

  const managerUser = {
    id: 'user_1',
    username: 'admin',
    passwordHash: '',
    displayName: '门店管理员',
    staffId: 'st_1',
    staff: {
      id: 'st_1',
      role: '店长',
      permissions: ['dashboard'],
    },
  };

  const techUser = {
    id: 'user_2',
    username: 'tech',
    passwordHash: '',
    displayName: '李洗护',
    staffId: 'st_2',
    staff: {
      id: 'st_2',
      role: '洗护技师',
      permissions: ['dashboard', 'order'],
    },
  };

  beforeEach(async () => {
    prisma = {
      user: { findUnique: jest.fn() },
    };
    jwt = { signAsync: jest.fn().mockResolvedValue('jwt-token') };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwt },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  describe('login', () => {
    it('returns token, displayName and all permissions for manager', async () => {
      managerUser.passwordHash = await bcrypt.hash('admin123', 4);
      prisma.user.findUnique.mockResolvedValue(managerUser);

      const result = await service.login({
        username: 'admin',
        password: 'admin123',
      });

      expect(result).toEqual({
        token: 'jwt-token',
        displayName: '门店管理员',
        permissions: [...PERMISSIONS],
      });
      expect(jwt.signAsync).toHaveBeenCalledWith({
        userId: 'user_1',
        displayName: '门店管理员',
        permissions: [...PERMISSIONS],
      });
    });

    it('returns staff permissions for non-manager', async () => {
      techUser.passwordHash = await bcrypt.hash('pass', 4);
      prisma.user.findUnique.mockResolvedValue(techUser);

      const result = await service.login({
        username: 'tech',
        password: 'pass',
      });

      expect(result.permissions).toEqual(['dashboard', 'order']);
      expect(jwt.signAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user_2',
          permissions: ['dashboard', 'order'],
        }),
      );
    });

    it('throws unified message when user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ username: 'nobody', password: 'x' }),
      ).rejects.toMatchObject({
        response: { message: LOGIN_FAILED_MESSAGE },
        status: 401,
      });
    });

    it('throws unified message when password is wrong', async () => {
      managerUser.passwordHash = await bcrypt.hash('right', 4);
      prisma.user.findUnique.mockResolvedValue(managerUser);

      await expect(
        service.login({ username: 'admin', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);

      await expect(
        service.login({ username: 'admin', password: 'wrong' }),
      ).rejects.toMatchObject({
        response: { message: LOGIN_FAILED_MESSAGE },
      });
    });
  });

  describe('me', () => {
    it('returns current user with permissions', async () => {
      prisma.user.findUnique.mockResolvedValue(techUser);

      const result = await service.me('user_2');

      expect(result).toEqual({
        userId: 'user_2',
        username: 'tech',
        displayName: '李洗护',
        permissions: ['dashboard', 'order'],
      });
    });

    it('throws when user no longer exists', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.me('missing')).rejects.toMatchObject({
        response: { message: LOGIN_FAILED_MESSAGE },
        status: 401,
      });
    });
  });
});
