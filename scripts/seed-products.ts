import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding products (photo booth packages)...\n');

  // 1. 2 Hour Package - Basic
  const twoHour = await prisma.product.upsert({
    where: { id: 'product-2-hour' },
    update: {},
    create: {
      id: 'product-2-hour',
      name: '2 Hour Photo Booth Package',
      description: 'Perfect for intimate gatherings and small events. Includes unlimited prints, digital gallery, and props box.',
      price: 299.99,
      duration: 120, // 2 hours in minutes
      isActive: true,
    },
  });
  console.log('✅ Created:', twoHour.name);

  // 2. 3 Hour Package - Standard
  const threeHour = await prisma.product.upsert({
    where: { id: 'product-3-hour' },
    update: {},
    create: {
      id: 'product-3-hour',
      name: '3 Hour Photo Booth Package',
      description: 'Our most popular package! Ideal for weddings, birthdays, and corporate events. Includes unlimited prints, digital gallery, custom backdrop, and premium props.',
      price: 449.99,
      duration: 180, // 3 hours in minutes
      isActive: true,
    },
  });
  console.log('✅ Created:', threeHour.name);

  // 3. 4 Hour Package - Premium
  const fourHour = await prisma.product.upsert({
    where: { id: 'product-4-hour' },
    update: {},
    create: {
      id: 'product-4-hour',
      name: '4 Hour Photo Booth Package',
      description: 'Extended coverage for all-day events. Perfect for weddings, galas, and large corporate functions. Includes unlimited prints, video messages, custom overlays, premium backdrop, and deluxe props.',
      price: 599.99,
      duration: 240, // 4 hours in minutes
      isActive: true,
    },
  });
  console.log('✅ Created:', fourHour.name);

  // 4. Influencer Package
  const influencer = await prisma.product.upsert({
    where: { id: 'product-influencer' },
    update: {},
    create: {
      id: 'product-influencer',
      name: 'Influencer Content Package',
      description: 'Designed for content creators and influencers. 2 hours of dedicated photo booth time with professional lighting, green screen options, instant social sharing, and custom branded overlays. Perfect for product launches and brand events.',
      price: 399.99,
      duration: 120, // 2 hours in minutes
      isActive: true,
    },
  });
  console.log('✅ Created:', influencer.name);

  // 5. Custom Package
  const custom = await prisma.product.upsert({
    where: { id: 'product-custom' },
    update: {},
    create: {
      id: 'product-custom',
      name: 'Custom Photo Booth Package',
      description: 'Fully customizable package tailored to your specific needs. Choose your duration, features, and add-ons. Perfect for unique events requiring special setups. Contact us for a personalized quote.',
      price: 799.99,
      duration: 240, // Base 4 hours, customizable
      isActive: true,
    },
  });
  console.log('✅ Created:', custom.name);

  // 6. Corporate Event Package
  const corporate = await prisma.product.upsert({
    where: { id: 'product-corporate' },
    update: {},
    create: {
      id: 'product-corporate',
      name: 'Corporate Event Package',
      description: 'Professional photo booth experience for corporate events, trade shows, and team building. 3 hours of service with branded overlays, data capture, and instant social sharing. Includes setup/teardown and attendant.',
      price: 549.99,
      duration: 180, // 3 hours in minutes
      isActive: true,
    },
  });
  console.log('✅ Created:', corporate.name);

  // 7. Wedding Deluxe Package
  const wedding = await prisma.product.upsert({
    where: { id: 'product-wedding-deluxe' },
    update: {},
    create: {
      id: 'product-wedding-deluxe',
      name: 'Wedding Deluxe Package',
      description: 'Our premium wedding package with full-day coverage (5 hours). Includes custom wedding overlay design, unlimited prints, guest book album, video messages, premium backdrop and props, and a dedicated attendant. Make your special day unforgettable!',
      price: 749.99,
      duration: 300, // 5 hours in minutes
      isActive: true,
    },
  });
  console.log('✅ Created:', wedding.name);

  console.log('\n🎉 Products created successfully!');
  console.log('\n📦 Available Packages:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('1. 2 Hour Package        - $299.99 (2 hours)');
  console.log('2. 3 Hour Package        - $449.99 (3 hours) ⭐ Most Popular');
  console.log('3. 4 Hour Package        - $599.99 (4 hours)');
  console.log('4. Influencer Package    - $399.99 (2 hours)');
  console.log('5. Custom Package        - $799.99 (4 hours, customizable)');
  console.log('6. Corporate Package     - $549.99 (3 hours)');
  console.log('7. Wedding Deluxe        - $749.99 (5 hours) 💍');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding products:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
