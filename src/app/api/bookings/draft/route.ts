import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST - Create or update draft booking
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      id, // Draft ID if updating
      productId,
      scheduledAt,
      packageId,
      addOns = [],
      contactName,
      contactEmail,
      contactPhone,
      eventAddress,
      eventType,
      eventNotes,
      hasPowerSupply,
      hasParking,
      attendeeCount,
      referralSource,
      poNumber,
      costCentre,
      orgId,
    } = body;

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Check if user has an active OrgSeat
    const userOrgSeat = orgId
      ? null
      : await prisma.orgSeat.findFirst({
          where: {
            userId: session.user.id,
            isActive: true,
          },
          include: {
            org: true,
          },
        });

    const isCorporate = !!orgId || !!userOrgSeat || session.user.role === 'CORPORATE_MEMBER' || session.user.role === 'CORPORATE_ADMIN';
    const finalOrgId = orgId || userOrgSeat?.orgId || null;

    // Calculate final price (simplified for draft)
    const product = await prisma.product.findUnique({
      where: { id: productId, isActive: true },
    });
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    let finalPrice = product.price;
    // Apply corporate discount if applicable
    if (isCorporate && userOrgSeat && userOrgSeat.org && userOrgSeat.org.discountPercent) {
      finalPrice = finalPrice * (1 - userOrgSeat.org.discountPercent / 100);
    }

    // Add add-ons price
    if (addOns && Array.isArray(addOns)) {
      for (const addOnSelection of addOns) {
        const addOn = await prisma.addOn.findUnique({
          where: { id: addOnSelection.id, isActive: true },
        });
        if (addOn) {
          finalPrice += addOn.price * (addOnSelection.quantity || 1);
        }
      }
    }

    const booking = await prisma.$transaction(async (tx) => {
      let booking;
      
      if (id) {
        // Update existing draft
        booking = await tx.booking.update({
          where: { id, status: 'DRAFT', customerId: session.user.id },
          data: {
            productId,
            scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date(),
            packageId: packageId || null,
            orgId: finalOrgId,
            finalPrice,
            isCorporate,
            contactName: contactName || null,
            contactEmail: contactEmail || null,
            contactPhone: contactPhone || null,
            eventAddress: eventAddress || null,
            eventType: eventType || null,
            eventNotes: eventNotes || null,
            hasPowerSupply: hasPowerSupply || false,
            hasParking: hasParking || false,
            attendeeCount: attendeeCount || null,
            referralSource: referralSource || null,
            poNumber: poNumber || null,
            costCentre: costCentre || null,
          },
        });

        // Update add-ons
        await tx.bookingAddOn.deleteMany({
          where: { bookingId: id },
        });
      } else {
        // Create new draft
        const year = new Date().getFullYear();
        const timestamp = Date.now().toString().slice(-6);
        const bookingNumber = `BK-${year}-${timestamp}`;

        booking = await tx.booking.create({
          data: {
            bookingNumber,
            customerId: session.user.id,
            productId,
            scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date(),
            packageId: packageId || null,
            orgId: finalOrgId,
            finalPrice,
            status: 'DRAFT',
            isCorporate,
            contactName: contactName || null,
            contactEmail: contactEmail || null,
            contactPhone: contactPhone || null,
            eventAddress: eventAddress || null,
            eventType: eventType || null,
            eventNotes: eventNotes || null,
            hasPowerSupply: hasPowerSupply || false,
            hasParking: hasParking || false,
            attendeeCount: attendeeCount || null,
            referralSource: referralSource || null,
            poNumber: poNumber || null,
            costCentre: costCentre || null,
          },
        });
      }

      // Create/update add-ons
      if (addOns && Array.isArray(addOns) && addOns.length > 0) {
        for (const addOnSelection of addOns) {
          const addOn = await tx.addOn.findUnique({
            where: { id: addOnSelection.id, isActive: true },
          });
          if (addOn) {
            await tx.bookingAddOn.create({
              data: {
                bookingId: booking.id,
                addOnId: addOn.id,
                quantity: addOnSelection.quantity || 1,
                price: addOn.price,
              },
            });
          }
        }
      }

      return booking;
    });

    return NextResponse.json({ booking }, { status: 200 });
  } catch (error) {
    console.error('Draft save error:', error);
    return NextResponse.json({ error: 'Failed to save draft' }, { status: 500 });
  }
}

// PUT - Update draft (alias for POST)
export async function PUT(request: Request) {
  return POST(request);
}
