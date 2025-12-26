import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth-utils';

// Mark booking as INVOICED and generate invoice number
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();

    if (!user || (user.role !== 'ADMIN' && user.role !== 'STAFF')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        customer: true,
        product: true,
        org: true,
        addOns: {
          include: {
            addOn: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (!booking.isCorporate) {
      return NextResponse.json(
        { error: 'Only corporate bookings can be invoiced' },
        { status: 400 }
      );
    }

    // Generate invoice number
    const year = new Date().getFullYear();
    const timestamp = Date.now().toString().slice(-6);
    const invoiceNumber = `INV-${year}-${timestamp}`;

    // Update booking
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: 'INVOICED',
        invoiceNumber,
        invoiceSentAt: new Date(),
      },
    });

    // Add timeline entry
    await prisma.bookingTimeline.create({
      data: {
        bookingId: booking.id,
        userId: user.id,
        action: 'INVOICE_CREATED',
        details: `Invoice ${invoiceNumber} created by ${user.name || user.email}`,
      },
    });

    return NextResponse.json({
      booking: updatedBooking,
      invoiceNumber,
      message: 'Booking marked as invoiced',
    });
  } catch (error) {
    console.error('Invoice creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
}
