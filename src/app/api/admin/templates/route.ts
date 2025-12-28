import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hasRole } from '@/lib/guards';

// GET /api/admin/templates - Get all submitted templates
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has ADMIN or STAFF role
    if (!hasRole(session.user.role, 'STAFF') && !hasRole(session.user.role, 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get all bookings that have templates submitted
    const bookingsWithTemplates = await prisma.booking.findMany({
      where: {
        templateSubmitted: true,
      },
      include: {
        customer: {
          select: {
            name: true,
            email: true,
          },
        },
        product: {
          select: {
            name: true,
          },
        },
        designTemplate: {
          select: {
            id: true,
            thumbnailUrl: true,
          },
        },
      },
      orderBy: {
        templateSubmittedAt: 'desc',
      },
    });

    // Format the response
    const templates = bookingsWithTemplates.map((booking) => ({
      id: booking.id,
      bookingNumber: booking.bookingNumber,
      bookingId: booking.id,
      customerName: booking.customer.name || 'Unknown',
      customerEmail: booking.customer.email,
      productName: booking.product.name,
      eventDate: booking.scheduledAt.toISOString(),
      submittedAt: booking.templateSubmittedAt?.toISOString() || new Date().toISOString(),
      templateId: booking.designTemplate?.id || '',
      thumbnailUrl: booking.designTemplate?.thumbnailUrl,
    }));

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching admin templates:', error);
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
  }
}
