import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookingId, amount, depositOnly } = await request.json();

    if (!bookingId || !amount) {
      return NextResponse.json(
        { error: 'Missing bookingId or amount' },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        customer: {
          select: {
            email: true,
            name: true,
          },
        },
        product: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Verify booking belongs to user or user is admin
    if (booking.customerId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (booking.isCorporate) {
      return NextResponse.json(
        { error: 'Corporate bookings require invoicing, not direct payment' },
        { status: 400 }
      );
    }

    const paymentAmount = depositOnly
      ? Math.round(amount * 0.5 * 100)
      : Math.round(amount * 100);

    // Create Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: paymentAmount,
      currency: 'usd',
      metadata: {
        bookingId: booking.id,
        bookingNumber: booking.bookingNumber,
        userId: session.user.id,
        depositOnly: depositOnly ? 'true' : 'false',
      },
      automatic_payment_methods: { enabled: true },
      receipt_email: booking.customer.email || undefined,
      description: `${booking.product.name} - Booking #${booking.bookingNumber}`,
    });

    // Create payment record
    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: paymentAmount / 100,
        status: 'PENDING',
        stripePaymentId: paymentIntent.id,
        processedById: session.user.id,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: paymentAmount / 100,
    });
  } catch (error) {
    console.error('Payment intent error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}

