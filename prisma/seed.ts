import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PERMISSIONS, WASH_SERVICES } from '../src/common/constants/enums';

const prisma = new PrismaClient();

const SERVICE_SEED = [
  { code: 'fine_wash', name: '精洗', price: 198, durationMin: 120, sort: 1 },
  { code: 'deep_stain', name: '深度去污', price: 268, durationMin: 180, sort: 2 },
  { code: 'hardware_polish', name: '五金抛光', price: 158, durationMin: 90, sort: 3 },
  { code: 'color_restore', name: '补色修复', price: 580, durationMin: 360, sort: 4 },
  { code: 'care', name: '保养护理', price: 328, durationMin: 150, sort: 5 },
] as const;

async function main() {
  const staff = await prisma.staff.upsert({
    where: { phone: '13800001111' },
    update: { status: '在职', permissions: [...PERMISSIONS] },
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

  // 洗护技师（无 staff 权限，用于 RBAC 测试）
  const techStaff = await prisma.staff.upsert({
    where: { phone: '13800002222' },
    update: {},
    create: {
      name: '李洗护',
      phone: '13800002222',
      role: '洗护技师',
      status: '在职',
      permissions: ['dashboard', 'order'],
    },
  });
  await prisma.user.upsert({
    where: { username: 'tech' },
    update: {},
    create: {
      username: 'tech',
      passwordHash: await bcrypt.hash('tech123', 10),
      displayName: '李洗护',
      staffId: techStaff.id,
    },
  });

  for (const s of SERVICE_SEED) {
    const existing = await prisma.washService.findFirst({
      where: { OR: [{ code: s.code }, { name: s.name }] },
    });
    if (existing) {
      await prisma.washService.update({
        where: { id: existing.id },
        data: { code: s.code, name: s.name, enabled: true },
      });
    } else {
      await prisma.washService.create({
        data: { ...s, enabled: true },
      });
    }
  }

  console.log('Seed: admin/admin123, tech/tech123');
  console.log('Wash service codes:', WASH_SERVICES.join(', '));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
