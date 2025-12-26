import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe, STRIPE_WEBHOOK_SECRET } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature || !STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: 'Missing signature or webhook secret' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        // Update payment status
        const payment = await prisma.payment.findFirst({
          where: { stripePaymentId: session.id },
        });

        if (payment) {
          await prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: 'COMPLETED',
              processedAt: new Date(),
              stripePaymentId: session.payment_intent as string,
            },
          });

          // Update booking status if payment is complete
          const booking = await prisma.booking.findUnique({
            where: { id: payment.bookingId },
            include: { payments: true },
          });

          if (booking) {
            const totalPaid = booking.payments
              .filter((p) => p.status === 'COMPLETED')
              .reduce((sum, p) => sum + p.amount, 0);

            // If fully paid, mark as CONFIRMED
            if (totalPaid >= booking.finalPrice && booking.status === 'PENDING') {
              await prisma.booking.update({
                where: { id: booking.id },
                data: { status: 'CONFIRMED' },
              });

              // Add timeline entry
              await prisma.bookingTimeline.create({
                data: {
                  bookingId: booking.id,
                  action: 'PAYMENT_COMPLETED',
                  details: `Payment of $${payment.amount.toFixed(2)} completed`,
                },
              });
            }
          }
        }
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        const payment = await prisma.payment.findFirst({
          where: { stripePaymentId: paymentIntent.id },
        });

        if (payment && payment.status !== 'COMPLETED') {
          await prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: 'COMPLETED',
              processedAt: new Date(),
            },
          });

          // Update booking status if payment is complete
          const booking = await prisma.booking.findUnique({
            where: { id: payment.bookingId },
            include: { payments: true },
          });

          if (booking) {
            // Recalculate total paid including this payment
            const totalPaid = booking.payments
              .filter((p) => p.status === 'COMPLETED' || p.id === payment.id)
              .reduce((sum, p) => sum + p.amount, 0);

            // If fully paid and booking is still pending, mark as CONFIRMED
            if (totalPaid >= booking.finalPrice && booking.status === 'PENDING') {
              await prisma.booking.update({
                where: { id: booking.id },
                data: { status: 'CONFIRMED' },
              });

              // Add timeline entry
              await prisma.bookingTimeline.create({
                data: {
                  bookingId: booking.id,
                  action: 'PAYMENT_COMPLETED',
                  details: `Payment of $${payment.amount.toFixed(2)} completed. Booking confirmed.`,
                },
              });

              // Notify customer
              await prisma.notification.create({
                data: {
                  userId: booking.customerId,
                  type: 'IN_APP',
                  subject: 'Booking Confirmed',
                  message: `Your payment of $${payment.amount.toFixed(2)} was successful. Booking #${booking.bookingNumber} is now confirmed!`,
                  metadata: { bookingId: booking.id },
                },
              });
            } else {
              // Partial payment - add timeline entry
              await prisma.bookingTimeline.create({
                data: {
                  bookingId: booking.id,
                  action: 'PAYMENT_RECEIVED',
                  details: `Deposit payment of $${payment.amount.toFixed(2)} received. Remaining: $${(booking.finalPrice - totalPaid).toFixed(2)}`,
                },
              });
            }
          }
        }
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;

        const payment = await prisma.payment.findFirst({
          where: { stripePaymentId: charge.payment_intent as string },
        });

        if (payment) {
          await prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: 'REFUNDED',
              refundedAt: new Date(),
              stripeRefundId: charge.refunds?.data?.[0]?.id || null,
            },
          });

          // Add timeline entry
          await prisma.bookingTimeline.create({
            data: {
              bookingId: payment.bookingId,
              action: 'PAYMENT_REFUNDED',
              details: `Payment of $${payment.amount.toFixed(2)} refunded`,
            },
          });
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
