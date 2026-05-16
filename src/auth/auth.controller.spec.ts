import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PERMISSIONS } from '../common/constants/enums';

describe('AuthController', () => {
  let controller: AuthController;
  const authService = {
    login: jest.fn(),
    me: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get(AuthController);
  });

  it('login delegates to AuthService', async () => {
    const payload = {
      token: 't',
      displayName: '管理员',
      permissions: [...PERMISSIONS],
    };
    authService.login.mockResolvedValue(payload);

    await expect(
      controller.login({ username: 'admin', password: 'admin123' }),
    ).resolves.toEqual(payload);
    expect(authService.login).toHaveBeenCalledWith({
      username: 'admin',
      password: 'admin123',
    });
  });

  it('logout returns null', () => {
    expect(controller.logout()).toBeNull();
  });

  it('me passes userId from JWT payload', async () => {
    authService.me.mockResolvedValue({
      userId: 'u1',
      username: 'admin',
      displayName: '管理员',
      permissions: ['dashboard'],
    });

    const req = {
      user: { userId: 'u1', displayName: '管理员', permissions: ['dashboard'] },
    } as Parameters<AuthController['me']>[0];

    await expect(controller.me(req)).resolves.toEqual({
      userId: 'u1',
      username: 'admin',
      displayName: '管理员',
      permissions: ['dashboard'],
    });
    expect(authService.me).toHaveBeenCalledWith('u1');
  });
});
