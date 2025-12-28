import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding test users...');

  // Password for all test accounts: "Password123!"
  const password = 'Password123!';
  const hashedPassword = await bcrypt.hash(password, 10);

  // 1. Create Admin User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@selfy.com' },
    update: {},
    create: {
      email: 'admin@selfy.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
      emailVerified: new Date(),
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // 2. Create Normal Customer User
  const customer = await prisma.user.upsert({
    where: { email: 'customer@selfy.com' },
    update: {},
    create: {
      email: 'customer@selfy.com',
      name: 'John Customer',
      password: hashedPassword,
      role: 'CUSTOMER',
      emailVerified: new Date(),
      phone: '+1234567890',
    },
  });
  console.log('✅ Customer user created:', customer.email);

  // 3. Create Corporate Organization
  const corpOrg = await prisma.corporateOrg.upsert({
    where: { id: 'test-corp-org-1' },
    update: {},
    create: {
      id: 'test-corp-org-1',
      name: 'Tech Corp Inc.',
      email: 'contact@techcorp.com',
      phone: '+1987654321',
      address: '123 Business Ave, Tech City, TC 12345',
      maxSeats: 50,
      discountPercent: 15,
      isActive: true,
      ownerId: customer.id, // Using customer as owner for now
    },
  });
  console.log('✅ Corporate organization created:', corpOrg.name);

  // 4. Create Corporate Admin User
  const corporateAdmin = await prisma.user.upsert({
    where: { email: 'corporate@selfy.com' },
    update: {},
    create: {
      email: 'corporate@selfy.com',
      name: 'Jane Corporate',
      password: hashedPassword,
      role: 'CORPORATE_ADMIN',
      emailVerified: new Date(),
      phone: '+1555123456',
    },
  });
  console.log('✅ Corporate admin user created:', corporateAdmin.email);

  // Update corporate org to have the corporate admin as owner
  await prisma.corporateOrg.update({
    where: { id: corpOrg.id },
    data: {
      ownerId: corporateAdmin.id,
      admins: {
        connect: { id: corporateAdmin.id },
      },
    },
  });
  console.log('✅ Corporate admin linked to organization');

  // 5. Create Corporate Member User
  const corporateMember = await prisma.user.upsert({
    where: { email: 'member@selfy.com' },
    update: {},
    create: {
      email: 'member@selfy.com',
      name: 'Bob Member',
      password: hashedPassword,
      role: 'CORPORATE_MEMBER',
      emailVerified: new Date(),
      phone: '+1555789012',
    },
  });
  console.log('✅ Corporate member user created:', corporateMember.email);

  // Add corporate member to organization seat
  await prisma.orgSeat.upsert({
    where: {
      orgId_userId: {
        orgId: corpOrg.id,
        userId: corporateMember.id,
      },
    },
    update: {},
    create: {
      orgId: corpOrg.id,
      userId: corporateMember.id,
      isActive: true,
    },
  });
  console.log('✅ Corporate member added to organization seat');

  console.log('\n🎉 Test users created successfully!');
  console.log('\n📝 Login Credentials (all use same password):');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Password for all accounts: Password123!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n👤 ADMIN USER:');
  console.log('   Email: admin@selfy.com');
  console.log('   Role: ADMIN');
  console.log('   Access: Full system access, manage all bookings/templates');
  console.log('\n👤 CORPORATE ADMIN:');
  console.log('   Email: corporate@selfy.com');
  console.log('   Role: CORPORATE_ADMIN');
  console.log('   Organization: Tech Corp Inc.');
  console.log('   Access: Manage corporate org, approve bookings for members');
  console.log('\n👤 CORPORATE MEMBER:');
  console.log('   Email: member@selfy.com');
  console.log('   Role: CORPORATE_MEMBER');
  console.log('   Organization: Tech Corp Inc. (member)');
  console.log('   Access: Book events, create templates');
  console.log('\n👤 NORMAL CUSTOMER:');
  console.log('   Email: customer@selfy.com');
  console.log('   Role: CUSTOMER');
  console.log('   Access: Book events, create templates');
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding users:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
