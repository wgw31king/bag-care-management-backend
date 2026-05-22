import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/** 与 src/common/constants/enums 一致；seed 不依赖 src，便于 Windows 发布包仅含 dist */
const PERMISSIONS = [
  'dashboard',
  'order',
  'customer',
  'service',
  'staff',
] as const;

const ADMIN_PHONE = '13907511716';
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin';

async function main() {
  // 清理历史 mock / 测试数据，仅保留将写入的管理员
  await prisma.order.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.washService.deleteMany();
  await prisma.user.deleteMany();
  await prisma.staff.deleteMany();

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  const staff = await prisma.staff.create({
    data: {
      name: '刘亮',
      phone: ADMIN_PHONE,
      role: '店长',
      status: '在职',
      permissions: [...PERMISSIONS],
    },
  });

  await prisma.user.create({
    data: {
      username: ADMIN_USERNAME,
      passwordHash,
      displayName: '刘亮',
      staffId: staff.id,
    },
  });

  console.log('Seed 完成：仅管理员 刘亮');
  console.log(`  登录账号：${ADMIN_USERNAME}`);
  console.log(`  登录密码：${ADMIN_PASSWORD}`);
  console.log(`  手机：${ADMIN_PHONE}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
