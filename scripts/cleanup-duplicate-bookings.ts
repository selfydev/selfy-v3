/**
 * Cleanup Script: Remove duplicate bookings
 * 
 * This script identifies and removes duplicate bookings that may have been
 * created due to race conditions in the auto-save draft feature.
 * 
 * Run with: npx tsx scripts/cleanup-duplicate-bookings.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Scanning for duplicate bookings...\n');

  // Find all bookings grouped by customer, product, and scheduledAt
  const allBookings = await prisma.booking.findMany({
    select: {
      id: true,
      bookingNumber: true,
      customerId: true,
      productId: true,
      scheduledAt: true,
      status: true,
      finalPrice: true,
      createdAt: true,
      updatedAt: true,
      customer: {
        select: {
          email: true,
          name: true,
        },
      },
      product: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  console.log(`📊 Total bookings in database: ${allBookings.length}\n`);

  // Group bookings by customer + product + scheduledAt (within 1 minute window)
  const groupedBookings = new Map<string, typeof allBookings>();

  for (const booking of allBookings) {
    // Create a key based on customer, product, and scheduled time (rounded to minute)
    const scheduledMinute = new Date(booking.scheduledAt);
    scheduledMinute.setSeconds(0, 0);
    
    const key = `${booking.customerId}-${booking.productId}-${scheduledMinute.toISOString()}`;
    
    if (!groupedBookings.has(key)) {
      groupedBookings.set(key, []);
    }
    groupedBookings.get(key)!.push(booking);
  }

  // Find groups with more than 1 booking (potential duplicates)
  const duplicateGroups = Array.from(groupedBookings.entries())
    .filter(([_, bookings]) => bookings.length > 1);

  if (duplicateGroups.length === 0) {
    console.log('✅ No duplicate bookings found!\n');
    return;
  }

  console.log(`⚠️  Found ${duplicateGroups.length} group(s) with potential duplicates:\n`);

  let totalToDelete = 0;
  const bookingsToDelete: string[] = [];

  for (const [key, bookings] of duplicateGroups) {
    console.log(`\n📋 Group: ${bookings[0]?.customer?.name || 'Unknown'} - ${bookings[0]?.product?.name || 'Unknown Product'}`);
    console.log(`   Scheduled: ${bookings[0]?.scheduledAt.toLocaleString()}`);
    console.log(`   Found ${bookings.length} bookings:`);

    // Sort by priority: CONFIRMED > PENDING > DRAFT, then by createdAt
    const sortedBookings = [...bookings].sort((a, b) => {
      const statusPriority: Record<string, number> = {
        'CONFIRMED': 1,
        'IN_PROGRESS': 2,
        'COMPLETED': 3,
        'PENDING': 4,
        'INVOICED': 5,
        'DRAFT': 6,
        'CANCELLED': 7,
        'NO_SHOW': 8,
      };
      
      const aPriority = statusPriority[a.status] || 99;
      const bPriority = statusPriority[b.status] || 99;
      
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }
      
      // If same status, prefer the older one (first created)
      return a.createdAt.getTime() - b.createdAt.getTime();
    });

    // Keep the first one (highest priority), mark others for deletion
    const [keep, ...duplicates] = sortedBookings;
    
    console.log(`   ✅ KEEP: ${keep.bookingNumber} (${keep.status}) - Created: ${keep.createdAt.toLocaleString()}`);
    
    for (const dup of duplicates) {
      console.log(`   ❌ DELETE: ${dup.bookingNumber} (${dup.status}) - Created: ${dup.createdAt.toLocaleString()}`);
      bookingsToDelete.push(dup.id);
      totalToDelete++;
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 Summary: ${totalToDelete} booking(s) will be deleted\n`);

  if (bookingsToDelete.length === 0) {
    console.log('Nothing to delete.\n');
    return;
  }

  // Ask for confirmation (in non-interactive mode, you can set DRY_RUN=false)
  const isDryRun = process.env.DRY_RUN !== 'false';
  
  if (isDryRun) {
    console.log('🔒 DRY RUN MODE - No changes made.');
    console.log('   To actually delete, run with: DRY_RUN=false npx tsx scripts/cleanup-duplicate-bookings.ts\n');
    return;
  }

  console.log('🗑️  Deleting duplicate bookings...\n');

  // Delete in order: BookingAddOn, BookingTimeline, Payment, DesignTemplate, then Booking
  for (const bookingId of bookingsToDelete) {
    try {
      // Delete related records first
      await prisma.bookingAddOn.deleteMany({ where: { bookingId } });
      await prisma.bookingTimeline.deleteMany({ where: { bookingId } });
      await prisma.payment.deleteMany({ where: { bookingId } });
      await prisma.designTemplate.deleteMany({ where: { bookingId } });
      await prisma.notification.deleteMany({ 
        where: { 
          metadata: {
            path: ['bookingId'],
            equals: bookingId,
          },
        },
      });
      
      // Delete the booking
      await prisma.booking.delete({ where: { id: bookingId } });
      
      console.log(`   ✅ Deleted booking ${bookingId}`);
    } catch (error) {
      console.error(`   ❌ Failed to delete booking ${bookingId}:`, error);
    }
  }

  console.log('\n✅ Cleanup complete!\n');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

