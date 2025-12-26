import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hasRole } from '@/lib/guards';

interface ApproveParams {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(_request: Request, { params }: ApproveParams) {
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
        product: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Only pending bookings can be approved' },
        { status: 400 }
      );
    }

    // Approve booking in a transaction
    const updatedBooking = await prisma.$transaction(async (tx) => {
      // Update booking to CONFIRMED status
      const approved = await tx.booking.update({
        where: { id },
        data: {
          status: 'CONFIRMED',
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
          bookingId: approved.id,
          userId: session.user.id,
          action: 'APPROVED',
          details: 'Booking approved by admin',
        },
      });

      // If using a corporate package, increment used credits
      if (approved.packageId) {
        await tx.corporatePackage.update({
          where: { id: approved.packageId },
          data: {
            usedCredits: {
              increment: 1,
            },
          },
        });
      }

      // Create notification for the customer
      await tx.notification.create({
        data: {
          userId: approved.customerId,
          type: 'IN_APP',
          subject: 'Booking Confirmed',
          message: `Your booking ${approved.bookingNumber} has been confirmed. See you on ${new Date(approved.scheduledAt).toLocaleDateString()}!`,
          metadata: {
            bookingId: approved.id,
            bookingNumber: approved.bookingNumber,
            type: 'booking_confirmed',
          },
        },
      });

      return approved;
    });

    return NextResponse.json(
      {
        booking: updatedBooking,
        message: 'Booking approved successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Booking approval error:', error);
    return NextResponse.json({ error: 'Failed to approve booking' }, { status: 500 });
  }
}

