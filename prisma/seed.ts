import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PERMISSIONS } from '../src/common/constants/enums';

const prisma = new PrismaClient();

async function main() {
  const staff = await prisma.staff.upsert({
    where: { phone: '13800001111' },
    update: {},
    create: {
      name: '王店长',
      phone: '13800001111',
      role: '店长',
      status: '在职',
      permissions: [...PERMISSIONS],
    },
  });

  const passwordHash = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash,
      displayName: '门店管理员',
      staffId: staff.id,
    },
  });

  const services = [
    { name: '精洗', price: 198, durationMin: 120, enabled: true, sort: 1 },
    { name: '深度去污', price: 268, durationMin: 180, enabled: true, sort: 2 },
    { name: '五金抛光', price: 158, durationMin: 90, enabled: true, sort: 3 },
    { name: '补色修复', price: 580, durationMin: 360, enabled: true, sort: 4 },
    { name: '保养护理', price: 328, durationMin: 150, enabled: true, sort: 5 },
  ];

  for (const s of services) {
    const existing = await prisma.washService.findFirst({
      where: { name: s.name },
    });
    if (!existing) {
      await prisma.washService.create({ data: s });
    }
  }

  const customerCount = await prisma.customer.count();
  if (customerCount === 0) {
    for (let i = 1; i <= 5; i++) {
      await prisma.customer.create({
        data: {
          name: `客户${i}`,
          phone: `1392000000${i}`,
          wechat: `wx_c${i}`,
          tag: i === 2 ? 'VIP' : '普通',
          orderCount: 0,
          remark: '',
        },
      });
    }
  }

  const orderCount = await prisma.order.count();
  if (orderCount === 0) {
    const customer = await prisma.customer.findFirst();
    const now = Date.now();
    await prisma.order.create({
      data: {
        orderNo: `BW${String(now).slice(-10)}`,
        customerName: customer?.name ?? '演示客户',
        phone: customer?.phone ?? '13920000001',
        brand: 'Gucci',
        style: '手提包',
        color: '棕色',
        material: '帆布',
        defectDesc: '边角轻微磨损',
        defectImages: [],
        washServices: ['fine_wash', 'deep_stain'],
        orderTime: new Date().toISOString().slice(0, 10) + ' 10:00:00',
        expectPickupTime: new Date(Date.now() + 3 * 86400000)
          .toISOString()
          .slice(0, 10) + ' 18:00:00',
        amount: 500,
        prepay: 150,
        remark: '演示订单',
        status: 'washing',
        createdAt: BigInt(now),
        customerId: customer?.id,
      },
    });
    if (customer) {
      await prisma.customer.update({
        where: { id: customer.id },
        data: { orderCount: 1, lastVisit: new Date().toISOString().slice(0, 10) },
      });
    }
  }

  console.log('Seed completed: admin / admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
