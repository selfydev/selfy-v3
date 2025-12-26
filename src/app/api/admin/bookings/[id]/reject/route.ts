import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hasRole } from '@/lib/guards';

interface RejectParams {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(_request: Request, { params }: RejectParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has ADMIN role
    if (!hasRole(session.user.role, 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { id } = await params;

    // Get the booking
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Only pending bookings can be rejected' },
        { status: 400 }
      );
    }

    // Reject booking in a transaction
    const updatedBooking = await prisma.$transaction(async (tx) => {
      // Update booking to CANCELLED status
      const rejected = await tx.booking.update({
        where: { id },
        data: {
          status: 'CANCELLED',
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
        },
      });

      // Create timeline entry
      await tx.bookingTimeline.create({
        data: {
          bookingId: rejected.id,
          userId: session.user.id,
          action: 'REJECTED',
          details: 'Booking rejected by admin',
        },
      });

      // Create notification for the customer
      await tx.notification.create({
        data: {
          userId: rejected.customerId,
          type: 'IN_APP',
          subject: 'Booking Cancelled',
          message: `Unfortunately, your booking ${rejected.bookingNumber} could not be confirmed. Please contact us for more information or to reschedule.`,
          metadata: {
            bookingId: rejected.id,
            bookingNumber: rejected.bookingNumber,
            type: 'booking_rejected',
          },
        },
      });

      return rejected;
    });

    return NextResponse.json(
      {
        booking: updatedBooking,
        message: 'Booking rejected successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Booking rejection error:', error);
    return NextResponse.json({ error: 'Failed to reject booking' }, { status: 500 });
  }
}

