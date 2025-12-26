import { PrismaClient, UserRole, BookingStatus, PaymentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clean existing data (in reverse order of dependencies)
  console.log('🗑️  Cleaning existing data...');
  await prisma.bookingTimeline.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.corporatePackage.deleteMany();
  await prisma.orgSeat.deleteMany();
  await prisma.corporateOrg.deleteMany();
  await prisma.product.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.automationLog.deleteMany();
  await prisma.automationRule.deleteMany();
  await prisma.templateVersion.deleteMany();
  await prisma.template.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  // Create Admin User
  console.log('👤 Creating admin user...');
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@selfy.com',
      password: await bcrypt.hash('Admin123', 10),
      role: UserRole.ADMIN,
      phone: '+1234567890',
    },
  });

  // Create Staff User
  console.log('👨‍💼 Creating staff user...');
  const staff = await prisma.user.create({
    data: {
      name: 'Staff Member',
      email: 'staff@selfy.com',
      password: await bcrypt.hash('Staff123', 10),
      role: UserRole.STAFF,
      phone: '+1234567891',
    },
  });

  // Create 3 Customer Users
  console.log('👥 Creating customer users...');
  const customer1 = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john@example.com',
      password: await bcrypt.hash('Customer123', 10),
      role: UserRole.CUSTOMER,
      phone: '+1234567892',
    },
  });

  void (await prisma.user.create({
    data: {
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: await bcrypt.hash('Customer123', 10),
      role: UserRole.CUSTOMER,
      phone: '+1234567893',
    },
  }));

  void (await prisma.user.create({
    data: {
      name: 'Mike Johnson',
      email: 'mike@example.com',
      password: await bcrypt.hash('Customer123', 10),
      role: UserRole.CUSTOMER,
      phone: '+1234567894',
    },
  }));

  // Create Corporate Admin and Members
  console.log('🏢 Creating corporate users...');
  const corpAdmin = await prisma.user.create({
    data: {
      name: 'Corporate Admin',
      email: 'corp.admin@techcorp.com',
      password: await bcrypt.hash('Corp123', 10),
      role: UserRole.CORPORATE_ADMIN,
      phone: '+1234567895',
    },
  });

  const corpMember1 = await prisma.user.create({
    data: {
      name: 'Alice Johnson',
      email: 'alice@techcorp.com',
      password: await bcrypt.hash('Corp123', 10),
      role: UserRole.CORPORATE_MEMBER,
      phone: '+1234567896',
    },
  });

  const corpMember2 = await prisma.user.create({
    data: {
      name: 'Bob Williams',
      email: 'bob@techcorp.com',
      password: await bcrypt.hash('Corp123', 10),
      role: UserRole.CORPORATE_MEMBER,
      phone: '+1234567897',
    },
  });

  // Create Corporate Organization
  console.log('🏢 Creating corporate organization...');
  const techCorp = await prisma.corporateOrg.create({
    data: {
      name: 'Tech Corp Inc.',
      email: 'info@techcorp.com',
      phone: '+1234567898',
      address: '123 Tech Street, Silicon Valley, CA 94000',
      maxSeats: 10,
      discountPercent: 15,
      isActive: true,
      ownerId: corpAdmin.id,
      admins: {
        connect: [{ id: corpAdmin.id }],
      },
    },
  });

  // Create Organization Seats
  console.log('💺 Creating organization seats...');
  await prisma.orgSeat.createMany({
    data: [
      {
        orgId: techCorp.id,
        userId: corpMember1.id,
        isActive: true,
      },
      {
        orgId: techCorp.id,
        userId: corpMember2.id,
        isActive: true,
      },
    ],
  });

  // Create 5 Products
  console.log('📦 Creating products...');
  const product1 = await prisma.product.create({
    data: {
      name: 'Premium Haircut',
      description: 'Professional haircut with styling',
      price: 50.0,
      duration: 60,
      isActive: true,
    },
  });

  void (await prisma.product.create({
    data: {
      name: 'Beard Trim',
      description: 'Professional beard trimming and shaping',
      price: 25.0,
      duration: 30,
      isActive: true,
    },
  }));

  void (await prisma.product.create({
    data: {
      name: 'Hair Coloring',
      description: 'Full hair coloring service',
      price: 120.0,
      duration: 120,
      isActive: true,
    },
  }));

  const product4 = await prisma.product.create({
    data: {
      name: 'Massage Therapy',
      description: 'Relaxing 60-minute massage',
      price: 80.0,
      duration: 60,
      isActive: true,
    },
  });

  void (await prisma.product.create({
    data: {
      name: 'Spa Package',
      description: 'Complete spa experience with multiple treatments',
      price: 200.0,
      duration: 180,
      isActive: true,
    },
  }));

  // Create 3 Corporate Packages (1 corporate-only)
  console.log('📋 Creating corporate packages...');
  void (await prisma.corporatePackage.create({
    data: {
      orgId: techCorp.id,
      name: 'Basic Wellness Package',
      description: '10 service credits for basic services',
      totalCredits: 10,
      usedCredits: 0,
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      isActive: true,
    },
  }));

  const package2 = await prisma.corporatePackage.create({
    data: {
      orgId: techCorp.id,
      name: 'Premium Wellness Package',
      description: '25 service credits for premium services with extra 5% discount',
      totalCredits: 25,
      usedCredits: 5,
      permanentDiscountPercent: 5,
      expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 180 days
      isActive: true,
    },
  });

  void (await prisma.corporatePackage.create({
    data: {
      orgId: techCorp.id,
      name: 'Executive Package',
      description: 'Unlimited premium services for executives with extra 10% discount',
      totalCredits: 50,
      usedCredits: 0,
      permanentDiscountPercent: 10,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 365 days
      isActive: true,
    },
  }));

  // Create sample bookings
  console.log('📅 Creating sample bookings...');
  const booking1 = await prisma.booking.create({
    data: {
      bookingNumber: 'BK-2025-0001',
      customerId: customer1.id,
      productId: product1.id,
      assignedStaffId: staff.id,
      scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      status: BookingStatus.CONFIRMED,
      finalPrice: 50.0,
      notes: 'First time customer',
    },
  });

  const booking2 = await prisma.booking.create({
    data: {
      bookingNumber: 'BK-2025-0002',
      customerId: corpMember1.id,
      productId: product4.id,
      assignedStaffId: staff.id,
      orgId: techCorp.id,
      packageId: package2.id,
      scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      status: BookingStatus.CONFIRMED,
      finalPrice: 68.0, // 15% corporate discount applied
      notes: 'Corporate package booking',
    },
  });

  // Create booking timeline entries
  console.log('📊 Creating booking timeline entries...');
  await prisma.bookingTimeline.createMany({
    data: [
      {
        bookingId: booking1.id,
        userId: customer1.id,
        action: 'CREATED',
        details: 'Booking created by customer',
      },
      {
        bookingId: booking1.id,
        userId: admin.id,
        action: 'CONFIRMED',
        details: 'Booking confirmed by admin',
      },
      {
        bookingId: booking2.id,
        userId: corpMember1.id,
        action: 'CREATED',
        details: 'Corporate booking created',
      },
    ],
  });

  // Create payments
  console.log('💳 Creating payments...');
  await prisma.payment.createMany({
    data: [
      {
        bookingId: booking1.id,
        amount: 50.0,
        status: PaymentStatus.COMPLETED,
        processedById: admin.id,
        processedAt: new Date(),
        notes: 'Cash payment',
      },
      {
        bookingId: booking2.id,
        amount: 68.0,
        status: PaymentStatus.PENDING,
        notes: 'Corporate invoice pending',
      },
    ],
  });

  console.log('✅ Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log('  - Users: 8 (1 admin, 1 staff, 3 customers, 3 corporate)');
  console.log('  - Corporate Orgs: 1 (Tech Corp Inc.)');
  console.log('  - Organization Seats: 2');
  console.log('  - Products: 5');
  console.log('  - Corporate Packages: 3');
  console.log('  - Bookings: 2');
  console.log('  - Timeline Entries: 3');
  console.log('  - Payments: 2');
  console.log('\n🔐 Login Credentials:');
  console.log('  Admin: admin@selfy.com / Admin123');
  console.log('  Staff: staff@selfy.com / Staff123');
  console.log('  Customer: john@example.com / Customer123');
  console.log('  Corporate Admin: corp.admin@techcorp.com / Corp123');
  console.log('  Corporate Member: alice@techcorp.com / Corp123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
