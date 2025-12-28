import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Verifying test users...\n');

  const users = await prisma.user.findMany({
    where: {
      email: {
        in: ['admin@selfy.com', 'corporate@selfy.com', 'member@selfy.com', 'customer@selfy.com'],
      },
    },
    select: {
      email: true,
      name: true,
      role: true,
      emailVerified: true,
    },
    orderBy: {
      email: 'asc',
    },
  });

  if (users.length === 0) {
    console.log('❌ No test users found!');
    return;
  }

  console.log('✅ Found', users.length, 'test users:\n');
  users.forEach((user) => {
    console.log(`   📧 ${user.email}`);
    console.log(`   👤 ${user.name}`);
    console.log(`   🔑 Role: ${user.role}`);
    console.log(`   ✓  Verified: ${user.emailVerified ? 'Yes' : 'No'}`);
    console.log('');
  });
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
