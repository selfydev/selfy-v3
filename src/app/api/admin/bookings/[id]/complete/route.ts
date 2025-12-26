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

    // Update booking to COMPLETED
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    // Create timeline entry
    await prisma.bookingTimeline.create({
      data: {
        bookingId: id,
        userId: session.user.id,
        action: 'Booking Completed',
        details: `Booking marked as completed by ${session.user.name || session.user.email}`,
      },
    });

    // Notify customer
    await prisma.notification.create({
      data: {
        userId: booking.customerId,
        type: 'IN_APP',
        subject: 'Booking Completed',
        message: `Your booking #${booking.bookingNumber} has been marked as completed. Thank you for choosing our services!`,
        metadata: { bookingId: id },
      },
    });

    return NextResponse.json({ success: true, booking: updatedBooking });
  } catch (error) {
    console.error('Error completing booking:', error);
    return NextResponse.json(
      { error: 'Failed to complete booking' },
      { status: 500 }
    );
  }
}

