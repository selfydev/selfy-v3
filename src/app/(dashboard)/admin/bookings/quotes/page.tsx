import { requireRole } from '@/lib/guards';
import { prisma } from '@/lib/prisma';
import QuoteRequestsClient from './QuoteRequestsClient';

export default async function QuoteRequestsPage() {
  await requireRole('ADMIN', '/dashboard');

  // Get all bookings with quote requests
  const quoteRequests = await prisma.booking.findMany({
    where: {
      quoteRequested: true,
    },
    include: {
      product: true,
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
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
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Quote Requests</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Review and approve corporate booking quote requests.
        </p>
      </div>

      <QuoteRequestsClient initialQuoteRequests={quoteRequests} />
    </div>
  );
}
