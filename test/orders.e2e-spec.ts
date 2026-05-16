import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { createTestApp, loginAsAdmin } from './test-app.util';

describe('Orders (e2e)', () => {
  let app: INestApplication<App>;
  let token: string;
  const phone = `139${Date.now().toString().slice(-8)}`;

  const orderPayload = {
    customerName: '集成测试客户',
    phone,
    wechatNote: 'wx_test',
    brand: 'Gucci',
    style: '手提包',
    color: '黑色',
    material: '牛皮',
    defectDesc: '边角磨损',
    defectImages: ['/uploads/demo.jpg'],
    washServices: ['fine_wash', 'deep_stain'],
    orderTime: '2026-05-17 10:00:00',
    expectPickupTime: '2026-05-20 18:00:00',
    amount: 680,
    prepay: 200,
    remark: 'e2e',
  };

  beforeAll(async () => {
    app = await createTestApp();
    token = await loginAsAdmin(app);
  });

  afterAll(async () => {
    await app.close();
  });

  it('create → get → update → patch status → list filter → soft delete', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send(orderPayload)
      .expect(201);

    expect(createRes.body.code).toBe(0);
    const created = createRes.body.data;
    expect(created.orderNo).toMatch(/^BW\d{10}$/);
    expect(created.status).toBe('pending_receive');
    expect(created.customerName).toBe(orderPayload.customerName);
    expect(created.washServices).toEqual(orderPayload.washServices);
    expect(typeof created.createdAt).toBe('number');

    const orderId = created.id as string;

    await request(app.getHttpServer())
      .get(`/api/orders/${orderId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.data.id).toBe(orderId);
        expect(res.body.data.orderNo).toBe(created.orderNo);
      });

    const updateRes = await request(app.getHttpServer())
      .put(`/api/orders/${orderId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ brand: 'Chanel', amount: 720 })
      .expect(200);

    expect(updateRes.body.data.brand).toBe('Chanel');
    expect(updateRes.body.data.amount).toBe(720);

    const statusRes = await request(app.getHttpServer())
      .patch(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'washing' })
      .expect(200);

    expect(statusRes.body.data.status).toBe('washing');

    const listRes = await request(app.getHttpServer())
      .get('/api/orders')
      .query({
        page: 1,
        pageSize: 50,
        keyword: created.orderNo,
        status: 'washing',
      })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(listRes.body.data.list.some((o: { id: string }) => o.id === orderId)).toBe(
      true,
    );

    await request(app.getHttpServer())
      .delete(`/api/orders/${orderId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    await request(app.getHttpServer())
      .get(`/api/orders/${orderId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404);

    const afterDeleteList = await request(app.getHttpServer())
      .get('/api/orders')
      .query({ keyword: created.orderNo })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(
      afterDeleteList.body.data.list.some((o: { id: string }) => o.id === orderId),
    ).toBe(false);
  });

  it('rejects invalid washServices', async () => {
    await request(app.getHttpServer())
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        ...orderPayload,
        phone: `138${Date.now().toString().slice(-8)}`,
        washServices: ['invalid_code'],
      })
      .expect(422);
  });

  it('rejects invalid datetime format', async () => {
    await request(app.getHttpServer())
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        ...orderPayload,
        phone: `137${Date.now().toString().slice(-8)}`,
        orderTime: '2026/05/17',
      })
      .expect(422);
  });
});
