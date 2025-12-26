import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !['ADMIN', 'STAFF'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Get the booking
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { customer: true },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Update booking to NO_SHOW
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: 'NO_SHOW',
      },
    });

    // Create timeline entry
    await prisma.bookingTimeline.create({
      data: {
        bookingId: id,
        userId: session.user.id,
        action: 'Marked as No-Show',
        details: `Customer did not show up. Marked by ${session.user.name || session.user.email}`,
      },
    });

    // Notify customer
    await prisma.notification.create({
      data: {
        userId: booking.customerId,
        type: 'IN_APP',
        subject: 'Booking No-Show',
        message: `Your booking #${booking.bookingNumber} has been marked as a no-show. Please contact us if you have any questions.`,
        metadata: { bookingId: id },
      },
    });

    return NextResponse.json({ success: true, booking: updatedBooking });
  } catch (error) {
    console.error('Error marking booking as no-show:', error);
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    );
  }
}

