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

    const body = await request.json();
    const { bookingId, amount, depositOnly } = body;

    if (!bookingId || !amount) {
      return NextResponse.json(
        { error: 'Missing bookingId or amount' },
        { status: 400 }
      );
    }

    // Get booking details
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

    // Don't allow payment for corporate bookings (they use invoicing)
    if (booking.isCorporate) {
      return NextResponse.json(
        { error: 'Corporate bookings require invoicing, not direct payment' },
        { status: 400 }
      );
    }

    // Calculate payment amount
    const paymentAmount = depositOnly ? Math.round(amount * 0.5 * 100) : Math.round(amount * 100);

    // Create Stripe Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: booking.product.name,
              description: `Booking #${booking.bookingNumber}`,
            },
            unit_amount: paymentAmount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/bookings/${bookingId}?payment=success`,
      cancel_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/bookings/${bookingId}?payment=cancelled`,
      customer_email: booking.customer.email || undefined,
      metadata: {
        bookingId: booking.id,
        bookingNumber: booking.bookingNumber,
        userId: session.user.id,
        depositOnly: depositOnly ? 'true' : 'false',
      },
    });

    // Create payment record
    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: paymentAmount / 100,
        status: 'PENDING',
        stripePaymentId: checkoutSession.id,
        processedById: session.user.id,
      },
    });

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
