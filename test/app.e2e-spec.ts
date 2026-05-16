import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { createTestApp, loginAsAdmin } from './test-app.util';

describe('App (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('auth login returns token', async () => {
    const token = await loginAsAdmin(app);
    expect(token).toBeTruthy();
  });

  it('protected route rejects without token', () => {
    return request(app.getHttpServer()).get('/api/orders').expect(401);
  });
});
