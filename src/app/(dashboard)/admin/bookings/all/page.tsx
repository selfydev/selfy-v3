import { requireRole } from '@/lib/guards';
import { prisma } from '@/lib/prisma';
import AllBookingsClient from './AllBookingsClient';

interface SearchParams {
  status?: string;
  search?: string;
  corporate?: string;
}

export default async function AllBookingsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireRole('ADMIN', '/dashboard');

  const params = await searchParams;
  const statusFilter = params.status || 'all';
  const searchQuery = params.search || '';
  const corporateFilter = params.corporate || 'all';

  // Build where clause based on filters
  const whereClause: Record<string, unknown> = {};

  if (statusFilter !== 'all') {
    whereClause['status'] = statusFilter;
  }

  if (corporateFilter === 'corporate') {
    whereClause['isCorporate'] = true;
  } else if (corporateFilter === 'regular') {
    whereClause['isCorporate'] = false;
  }

  if (searchQuery) {
    whereClause['OR'] = [
      { bookingNumber: { contains: searchQuery, mode: 'insensitive' } },
      { customer: { name: { contains: searchQuery, mode: 'insensitive' } } },
      { customer: { email: { contains: searchQuery, mode: 'insensitive' } } },
      { org: { name: { contains: searchQuery, mode: 'insensitive' } } },
    ];
  }

  // Get all bookings with filters
  const bookings = await prisma.booking.findMany({
    where: whereClause,
    include: {
      product: {
        select: {
          id: true,
          name: true,
          price: true,
          duration: true,
        },
      },
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
        },
      },
      org: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      package: {
        select: {
          id: true,
          name: true,
        },
      },
      assignedStaff: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      payments: {
        select: {
          id: true,
          amount: true,
          status: true,
          createdAt: true,
        },
      },
      quoteApprovedBy: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 100,
  });

  // Get counts for each status
  const [totalCount, draftCount, pendingCount, confirmedCount, completedCount, cancelledCount, invoicedCount] = await Promise.all([
    prisma.booking.count(),
    prisma.booking.count({ where: { status: 'DRAFT' } }),
    prisma.booking.count({ where: { status: 'PENDING' } }),
    prisma.booking.count({ where: { status: 'CONFIRMED' } }),
    prisma.booking.count({ where: { status: 'COMPLETED' } }),
    prisma.booking.count({ where: { status: 'CANCELLED' } }),
    prisma.booking.count({ where: { status: 'INVOICED' } }),
  ]);

  const statusCounts = {
    all: totalCount,
    DRAFT: draftCount,
    PENDING: pendingCount,
    CONFIRMED: confirmedCount,
    COMPLETED: completedCount,
    CANCELLED: cancelledCount,
    INVOICED: invoicedCount,
  };

  return (
    <div className="space-y-6 min-w-0">
      <div>
        <h1 className="text-2xl font-bold text-foreground">All Bookings</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          View, search, and manage all bookings in the system.
        </p>
      </div>

      <AllBookingsClient
        initialBookings={bookings}
        statusCounts={statusCounts}
        currentStatus={statusFilter}
        currentSearch={searchQuery}
        currentCorporateFilter={corporateFilter}
      />
    </div>
  );
}

