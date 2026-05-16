import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { readFileSync } from 'fs';
import { join } from 'path';
import { createTestApp, loginAsAdmin } from './test-app.util';

describe('Upload (e2e)', () => {
  let app: INestApplication<App>;
  let token: string;

  beforeAll(async () => {
    app = await createTestApp();
    token = await loginAsAdmin(app);
  });

  afterAll(async () => app.close());

  it('POST /api/upload/images returns urls', async () => {
    // 最小合法 PNG 1x1
    const png = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      'base64',
    );
    const res = await request(app.getHttpServer())
      .post('/api/upload/images')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', png, 'test.png')
      .expect(201);

    expect(res.body.code).toBe(0);
    expect(res.body.data.url).toMatch(/\/uploads\//);
    expect(res.body.data.urls).toHaveLength(1);
  });
});
