import { requireRole } from '@/lib/guards';
import { prisma } from '@/lib/prisma';
import PendingBookingsClient from './PendingBookingsClient';

export default async function AdminBookingsPage() {
  await requireRole('ADMIN', '/dashboard');

  // Get pending bookings that need approval (non-quote requests)
  const pendingBookings = await prisma.booking.findMany({
    where: {
      status: 'PENDING',
      quoteRequested: false,
    },
    include: {
      product: {
        select: {
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
          role: true,
        },
      },
      org: {
        select: {
          id: true,
          name: true,
        },
      },
      payments: {
        where: {
          status: 'COMPLETED',
        },
        select: {
          id: true,
          amount: true,
          status: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Get stats
  const stats = {
    pending: await prisma.booking.count({ where: { status: 'PENDING', quoteRequested: false } }),
    confirmed: await prisma.booking.count({ where: { status: 'CONFIRMED' } }),
    completed: await prisma.booking.count({ where: { status: 'COMPLETED' } }),
    cancelled: await prisma.booking.count({ where: { status: 'CANCELLED' } }),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Pending Bookings</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Review and approve booking requests from customers.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-lg bg-muted border-2 border-border p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Pending Approval</h3>
          <p className="mt-2 text-2xl font-bold text-foreground">{stats.pending}</p>
        </div>
        <div className="rounded-lg bg-card p-4 shadow">
          <h3 className="text-sm font-medium text-foreground0">Confirmed</h3>
          <p className="mt-2 text-2xl font-bold text-foreground">{stats.confirmed}</p>
        </div>
        <div className="rounded-lg bg-card p-4 shadow">
          <h3 className="text-sm font-medium text-foreground0">Completed</h3>
          <p className="mt-2 text-2xl font-bold text-foreground">{stats.completed}</p>
        </div>
        <div className="rounded-lg bg-card p-4 shadow">
          <h3 className="text-sm font-medium text-foreground0">Cancelled</h3>
          <p className="mt-2 text-2xl font-bold text-foreground">{stats.cancelled}</p>
        </div>
      </div>

      <PendingBookingsClient initialBookings={pendingBookings} />
    </div>
  );
}
