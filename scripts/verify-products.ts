import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Verifying products...\n');

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      price: 'asc',
    },
  });

  if (products.length === 0) {
    console.log('❌ No products found!');
    return;
  }

  console.log(`✅ Found ${products.length} active products:\n`);

  products.forEach((product) => {
    const hours = product.duration / 60;
    console.log(`📦 ${product.name}`);
    console.log(`   💰 Price: $${product.price.toFixed(2)}`);
    console.log(`   ⏰ Duration: ${hours} hour${hours !== 1 ? 's' : ''} (${product.duration} minutes)`);
    console.log(`   📝 ${product.description?.substring(0, 80)}...`);
    console.log('');
  });

  console.log(`💵 Price Range: $${Math.min(...products.map(p => p.price)).toFixed(2)} - $${Math.max(...products.map(p => p.price)).toFixed(2)}`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
