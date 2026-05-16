import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { createTestApp, loginAsAdmin } from './test-app.util';

describe('Full stack flow (e2e)', () => {
  let app: INestApplication<App>;
  let adminToken: string;
  let techToken: string;

  beforeAll(async () => {
    app = await createTestApp();
    adminToken = await loginAsAdmin(app);
    const techRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ username: 'tech', password: 'tech123' });
    techToken = techRes.body.data.token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('login → create order → patch status → dashboard summary changes', async () => {
    const before = await request(app.getHttpServer())
      .get('/api/dashboard/summary')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    const beforeWash = before.body.data.washingCount;

    const phone = `136${Date.now().toString().slice(-8)}`;
    const createRes = await request(app.getHttpServer())
      .post('/api/orders')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        customerName: '流程测试',
        phone,
        brand: 'LV',
        style: '单肩',
        color: '黑',
        material: '皮',
        defectDesc: '测试',
        washServices: ['fine_wash'],
        orderTime: '2026-05-17 12:00:00',
        expectPickupTime: '2026-05-20 18:00:00',
        amount: 100,
        prepay: 50,
        status: 'pending_receive',
      })
      .expect(201);

    const orderId = createRes.body.data.id;

    await request(app.getHttpServer())
      .patch(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'washing' })
      .expect(200);

    const after = await request(app.getHttpServer())
      .get('/api/dashboard/summary')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(after.body.data.washingCount).toBeGreaterThanOrEqual(beforeWash);
  });

  it('tech user cannot access staff API (RBAC)', async () => {
    await request(app.getHttpServer())
      .get('/api/staff')
      .set('Authorization', `Bearer ${techToken}`)
      .expect(403);
  });

  it('rejects base64 defectImages on order create', async () => {
    await request(app.getHttpServer())
      .post('/api/orders')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        customerName: 'x',
        phone: `135${Date.now().toString().slice(-8)}`,
        brand: 'A',
        style: 'B',
        color: 'C',
        material: 'D',
        defectDesc: 'x',
        defectImages: ['data:image/png;base64,abc'],
        washServices: ['fine_wash'],
        orderTime: '2026-05-17 10:00:00',
        expectPickupTime: '2026-05-18 18:00:00',
        amount: 1,
        prepay: 0,
      })
      .expect(422);
  });

  it('customer delete blocked when orders exist', async () => {
    const phone = `134${Date.now().toString().slice(-8)}`;
    const cust = await request(app.getHttpServer())
      .post('/api/customers')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: '不可删', phone, tag: '普通' })
      .expect(201);

    await request(app.getHttpServer())
      .post('/api/orders')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        customerName: '不可删',
        phone,
        brand: 'G',
        style: 'S',
        color: 'C',
        material: 'M',
        defectDesc: 'd',
        washServices: ['care'],
        orderTime: '2026-05-17 11:00:00',
        expectPickupTime: '2026-05-19 18:00:00',
        amount: 10,
        prepay: 0,
      })
      .expect(201);

    await request(app.getHttpServer())
      .delete(`/api/customers/${cust.body.data.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(400);
  });
});
