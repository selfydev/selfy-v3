import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hasRole } from '@/lib/guards';

export async function GET(_request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has ADMIN role
    if (!hasRole(session.user.role, 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

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

    return NextResponse.json({ quoteRequests });
  } catch (error) {
    console.error('Fetch quote requests error:', error);
    return NextResponse.json({ error: 'Failed to fetch quote requests' }, { status: 500 });
  }
}
