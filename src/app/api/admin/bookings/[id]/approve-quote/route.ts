import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hasRole } from '@/lib/guards';

interface ApproveQuoteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(request: Request, { params }: ApproveQuoteParams) {
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
    const body = await request.json();
    const { netTerms } = body;

    // Validate netTerms if provided (should be a positive number)
    if (netTerms !== undefined && (typeof netTerms !== 'number' || netTerms < 0)) {
      return NextResponse.json(
        { error: 'Net terms must be a positive number (days)' },
        { status: 400 }
      );
    }

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
        org: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (!booking.quoteRequested) {
      return NextResponse.json(
        { error: 'This booking does not have a quote request' },
        { status: 400 }
      );
    }

    // Approve quote in a transaction
    const updatedBooking = await prisma.$transaction(async (tx) => {
      // Update booking to CONFIRMED status and set quote approval fields
      const approved = await tx.booking.update({
        where: { id },
        data: {
          status: 'CONFIRMED',
          quoteRequested: false, // Quote is now approved
          quoteApprovedAt: new Date(),
          quoteApprovedById: session.user.id,
          netTerms: netTerms || null,
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
          org: true,
          package: true,
          quoteApprovedBy: {
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
          action: 'QUOTE_APPROVED',
          details: `Quote approved by admin${netTerms ? ` with ${netTerms} day net terms` : ''}`,
        },
      });

      // If using a package, increment used credits now that it's confirmed
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
          subject: 'Quote Approved',
          message: `Your quote request for booking ${approved.bookingNumber} has been approved.${netTerms ? ` Payment terms: ${netTerms} days.` : ''}`,
          metadata: {
            bookingId: approved.id,
            bookingNumber: approved.bookingNumber,
            type: 'quote_approved',
          },
        },
      });

      return approved;
    });

    return NextResponse.json(
      {
        booking: updatedBooking,
        message: 'Quote approved successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Quote approval error:', error);
    return NextResponse.json({ error: 'Failed to approve quote' }, { status: 500 });
  }
}
