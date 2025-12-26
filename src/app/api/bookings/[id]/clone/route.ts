import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface CloneParams {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(_request: Request, { params }: CloneParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Get the original booking
    const originalBooking = await prisma.booking.findUnique({
      where: { id },
      include: {
        addOns: true,
      },
    });

    if (!originalBooking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Check if user has permission to clone this booking
    const isOwner = originalBooking.customerId === session.user.id;
    const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'STAFF';
    
    // Corporate members can clone their org's bookings
    let isCorporateMember = false;
    if (originalBooking.orgId && (session.user.role === 'CORPORATE_ADMIN' || session.user.role === 'CORPORATE_MEMBER')) {
      const orgSeat = await prisma.orgSeat.findFirst({
        where: {
          userId: session.user.id,
          orgId: originalBooking.orgId,
          isActive: true,
        },
      });
      isCorporateMember = !!orgSeat;
    }

    if (!isOwner && !isAdmin && !isCorporateMember) {
      return NextResponse.json(
        { error: 'You do not have permission to clone this booking' },
        { status: 403 }
      );
    }

    // Generate new booking number
    const year = new Date().getFullYear();
    const timestamp = Date.now().toString().slice(-6);
    const bookingNumber = `BK-${year}-${timestamp}`;

    // Set scheduled date to tomorrow at the same time
    const originalTime = new Date(originalBooking.scheduledAt);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(originalTime.getHours(), originalTime.getMinutes(), 0, 0);

    // Create the cloned booking
    const clonedBooking = await prisma.$transaction(async (tx) => {
      const newBooking = await tx.booking.create({
        data: {
          bookingNumber,
          customerId: session.user.id, // New booking belongs to current user
          productId: originalBooking.productId,
          scheduledAt: tomorrow,
          notes: originalBooking.notes,
          orgId: originalBooking.orgId,
          packageId: originalBooking.packageId,
          finalPrice: originalBooking.finalPrice,
          status: 'DRAFT', // Cloned bookings start as drafts
          isCorporate: originalBooking.isCorporate,
          quoteRequested: false,
          contactName: originalBooking.contactName,
          contactEmail: originalBooking.contactEmail,
          contactPhone: originalBooking.contactPhone,
          eventAddress: originalBooking.eventAddress,
          eventType: originalBooking.eventType,
          eventNotes: originalBooking.eventNotes,
          hasPowerSupply: originalBooking.hasPowerSupply,
          hasParking: originalBooking.hasParking,
          attendeeCount: originalBooking.attendeeCount,
          referralSource: originalBooking.referralSource,
          poNumber: originalBooking.poNumber,
          costCentre: originalBooking.costCentre,
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
        },
      });

      // Clone add-ons
      if (originalBooking.addOns && originalBooking.addOns.length > 0) {
        for (const addOn of originalBooking.addOns) {
          await tx.bookingAddOn.create({
            data: {
              bookingId: newBooking.id,
              addOnId: addOn.addOnId,
              quantity: addOn.quantity,
              price: addOn.price,
            },
          });
        }
      }

      // Create timeline entry
      await tx.bookingTimeline.create({
        data: {
          bookingId: newBooking.id,
          userId: session.user.id,
          action: 'CLONED',
          details: `Booking cloned from ${originalBooking.bookingNumber}`,
        },
      });

      return newBooking;
    });

    return NextResponse.json(
      {
        booking: clonedBooking,
        message: 'Booking cloned successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Clone booking error:', error);
    return NextResponse.json({ error: 'Failed to clone booking' }, { status: 500 });
  }
}

