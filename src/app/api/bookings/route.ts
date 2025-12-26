import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';



// Helper function to create bulk bookings
async function createBulkBookings(
  customerId: string,
  productId: string,
  orgId: string | null,
  packageId: string | null,
  finalPrice: number,
  isCorporate: boolean,
  bulkLocations: Array<{ address: string; date: string; time: string }>,
  bookingData: any,
  prisma: any
) {
  // Create booking group
  const bookingGroup = await prisma.bookingGroup.create({
    data: {
      name: `Bulk Booking - ${new Date().toLocaleDateString()}`,
      description: `Bulk booking with ${bulkLocations.length} locations`,
    },
  });

  const bookings = await prisma.$transaction(
    bulkLocations.map((location, index) => {
      const scheduledAt = new Date(`${location.date}T${location.time}`);
      const year = new Date().getFullYear();
      const timestamp = Date.now().toString().slice(-6);
      const bookingNumber = `BK-${year}-${timestamp}-${index + 1}`;

      return prisma.booking.create({
        data: {
          bookingNumber,
          customerId,
          productId,
          scheduledAt,
          notes: bookingData.notes || null,
          orgId,
          packageId,
          finalPrice,
          status: 'PENDING',
          isCorporate,
          quoteRequested: false,
          contactName: bookingData.contactName || null,
          contactEmail: bookingData.contactEmail || null,
          contactPhone: bookingData.contactPhone || null,
          eventAddress: location.address || bookingData.eventAddress || null,
          eventType: bookingData.eventType || null,
          eventNotes: bookingData.eventNotes || null,
          hasPowerSupply: bookingData.hasPowerSupply || false,
          hasParking: bookingData.hasParking || false,
          attendeeCount: bookingData.attendeeCount || null,
          referralSource: bookingData.referralSource || null,
          poNumber: bookingData.poNumber || null,
          costCentre: bookingData.costCentre || null,
          bookingGroupId: bookingGroup.id,
        },
        include: {
          product: true,
          customer: { select: { id: true, name: true, email: true } },
          org: true,
          package: true,
        },
      });
    })
  );

  return { booking: bookings[0], bookings, bookingGroup };
}

// Helper function to create multi-day bookings
async function createMultiDayBookings(
  customerId: string,
  productId: string,
  orgId: string | null,
  packageId: string | null,
  finalPrice: number,
  isCorporate: boolean,
  multiDayDates: string[],
  baseScheduledAt: string | null,
  bookingData: any,
  prisma: any
) {
  const bookings = await prisma.$transaction(
    multiDayDates.map((date, index) => {
      const scheduledAt = baseScheduledAt
        ? new Date(new Date(baseScheduledAt).toISOString().split('T')[0] + 'T' + new Date(baseScheduledAt).toTimeString().split(' ')[0])
        : new Date(`${date}T10:00`);
      scheduledAt.setDate(new Date(date).getDate());

      const year = new Date().getFullYear();
      const timestamp = Date.now().toString().slice(-6);
      const bookingNumber = `BK-${year}-${timestamp}-${index + 1}`;

      return prisma.booking.create({
        data: {
          bookingNumber,
          customerId,
          productId,
          scheduledAt,
          notes: bookingData.notes || null,
          orgId,
          packageId,
          finalPrice,
          status: 'PENDING',
          isCorporate,
          quoteRequested: false,
          contactName: bookingData.contactName || null,
          contactEmail: bookingData.contactEmail || null,
          contactPhone: bookingData.contactPhone || null,
          eventAddress: bookingData.eventAddress || null,
          eventType: bookingData.eventType || null,
          eventNotes: bookingData.eventNotes || null,
          hasPowerSupply: bookingData.hasPowerSupply || false,
          hasParking: bookingData.hasParking || false,
          attendeeCount: bookingData.attendeeCount || null,
          referralSource: bookingData.referralSource || null,
          poNumber: bookingData.poNumber || null,
          costCentre: bookingData.costCentre || null,
        },
        include: {
          product: true,
          customer: { select: { id: true, name: true, email: true } },
          org: true,
          package: true,
        },
      });
    })
  );

  return { booking: bookings[0], bookings };
}

// Helper function to create recurring bookings
async function createRecurringBookings(
  customerId: string,
  productId: string,
  orgId: string | null,
  packageId: string | null,
  finalPrice: number,
  isCorporate: boolean,
  startDate: string,
  recurringRule: string,
  endDate: string | null,
  bookingData: any,
  prisma: any
) {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : null;
  const bookings = [];
  let currentDate = new Date(start);

  // Create parent booking
  const year = new Date().getFullYear();
  const timestamp = Date.now().toString().slice(-6);
  const parentBookingNumber = `BK-${year}-${timestamp}`;

  const parentBooking = await prisma.booking.create({
    data: {
      bookingNumber: parentBookingNumber,
      customerId,
      productId,
      scheduledAt: start,
      notes: bookingData.notes || null,
      orgId,
      packageId,
      finalPrice,
      status: 'PENDING',
      isCorporate,
      quoteRequested: false,
      isRecurring: true,
      recurringRule,
      recurringEndDate: end,
      contactName: bookingData.contactName || null,
      contactEmail: bookingData.contactEmail || null,
      contactPhone: bookingData.contactPhone || null,
      eventAddress: bookingData.eventAddress || null,
      eventType: bookingData.eventType || null,
      eventNotes: bookingData.eventNotes || null,
      hasPowerSupply: bookingData.hasPowerSupply || false,
      hasParking: bookingData.hasParking || false,
      attendeeCount: bookingData.attendeeCount || null,
      referralSource: bookingData.referralSource || null,
      poNumber: bookingData.poNumber || null,
      costCentre: bookingData.costCentre || null,
    },
    include: {
      product: true,
      customer: { select: { id: true, name: true, email: true } },
      org: true,
      package: true,
    },
  });

  bookings.push(parentBooking);

  // Generate recurring dates
  const maxOccurrences = 52; // Limit to 1 year of weekly bookings
  let occurrence = 0;

  while ((!end || currentDate <= end) && occurrence < maxOccurrences) {
    if (currentDate > start) {
      // Create child booking
      const childBookingNumber = `BK-${year}-${timestamp}-R${occurrence + 1}`;
      const childBooking = await prisma.booking.create({
        data: {
          bookingNumber: childBookingNumber,
          customerId,
          productId,
          scheduledAt: new Date(currentDate),
          notes: bookingData.notes || null,
          orgId,
          packageId,
          finalPrice,
          status: 'PENDING',
          isCorporate,
          quoteRequested: false,
          isRecurring: true,
          parentBookingId: parentBooking.id,
          contactName: bookingData.contactName || null,
          contactEmail: bookingData.contactEmail || null,
          contactPhone: bookingData.contactPhone || null,
          eventAddress: bookingData.eventAddress || null,
          eventType: bookingData.eventType || null,
          eventNotes: bookingData.eventNotes || null,
          hasPowerSupply: bookingData.hasPowerSupply || false,
          hasParking: bookingData.hasParking || false,
          attendeeCount: bookingData.attendeeCount || null,
          referralSource: bookingData.referralSource || null,
          poNumber: bookingData.poNumber || null,
          costCentre: bookingData.costCentre || null,
        },
      });
      bookings.push(childBooking);
    }

    // Calculate next date based on rule
    if (recurringRule === 'DAILY') {
      currentDate.setDate(currentDate.getDate() + 1);
    } else if (recurringRule === 'WEEKLY') {
      currentDate.setDate(currentDate.getDate() + 7);
    } else if (recurringRule === 'MONTHLY') {
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    occurrence++;
  }

  return { booking: parentBooking, bookings };
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      productId,
      scheduledAt,
      notes,
      orgId,
      packageId,
      finalPrice,
      isDraft = false,
      // Add-ons
      addOns = [],
      // Event Details
      contactName,
      contactEmail,
      contactPhone,
      eventAddress,
      eventType,
      eventNotes,
      // Event Essentials
      hasPowerSupply,
      hasParking,
      attendeeCount,
      referralSource,
      // Corporate fields
      poNumber,
      costCentre,
      vatRate,
      // Corporate booking options
      isMultiDay,
      multiDayDates = [],
      isRecurring,
      recurringRule,
      recurringEndDate,
      isBulkBooking,
      bulkLocations = [],
      holdSlot,
      requestQuote = false,
    } = body;

    // Validation
    if (!productId || finalPrice === undefined) {
      return NextResponse.json(
        { error: 'Product ID and final price are required' },
        { status: 400 }
      );
    }

    // Scheduled time is required unless it's a draft
    if (!isDraft && !scheduledAt) {
      return NextResponse.json(
        { error: 'Scheduled time is required for non-draft bookings' },
        { status: 400 }
      );
    }

    // Verify product exists and is active
    const product = await prisma.product.findUnique({
      where: { id: productId, isActive: true },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found or inactive' }, { status: 404 });
    }

    // Check if user has an active OrgSeat (if orgId not provided)
    const userOrgSeat = orgId
      ? null
      : await prisma.orgSeat.findFirst({
          where: {
            userId: session.user.id,
            isActive: true,
          },
        });

    // Determine if this is a corporate booking
    // User is corporate if they have an active OrgSeat OR their role is CORPORATE_MEMBER/CORPORATE_ADMIN OR orgId is provided
    const isCorporate = !!orgId || !!userOrgSeat || session.user.role === 'CORPORATE_MEMBER' || session.user.role === 'CORPORATE_ADMIN';
    
    // Use orgId from OrgSeat if not provided
    const finalOrgId = orgId || userOrgSeat?.orgId || null;

    // If package is selected, verify it and check credits (only for non-draft bookings)
    if (packageId && !isDraft) {
      const corporatePackage = await prisma.corporatePackage.findUnique({
        where: { id: packageId, isActive: true },
      });

      if (!corporatePackage) {
        return NextResponse.json(
          { error: 'Corporate package not found or inactive' },
          { status: 404 }
        );
      }

      // Check if package has available credits
      if (corporatePackage.usedCredits >= corporatePackage.totalCredits) {
        return NextResponse.json({ error: 'Package has no remaining credits' }, { status: 400 });
      }

      // Check if package is expired
      if (corporatePackage.expiresAt && new Date(corporatePackage.expiresAt) < new Date()) {
        return NextResponse.json({ error: 'Package has expired' }, { status: 400 });
      }
    }

    // Generate unique booking number
    const year = new Date().getFullYear();
    const timestamp = Date.now().toString().slice(-6);
    const bookingNumber = `BK-${year}-${timestamp}`;

    // All non-draft bookings start as PENDING (require admin approval for availability)
    const bookingStatus: 'DRAFT' | 'PENDING' = isDraft ? 'DRAFT' : 'PENDING';

    // Handle bulk bookings - create multiple bookings
    if (isBulkBooking && Array.isArray(bulkLocations) && bulkLocations.length > 0) {
      const result = await createBulkBookings(
        session.user.id,
        productId,
        finalOrgId,
        packageId,
        finalPrice,
        isCorporate,
        bulkLocations,
        body,
        prisma
      );
      return NextResponse.json(
        {
          booking: result.booking,
          bookings: result.bookings,
          bookingGroup: result.bookingGroup,
          message: `Bulk booking created with ${result.bookings.length} locations`,
        },
        { status: 201 }
      );
    }

    // Handle multi-day bookings
    if (isMultiDay && Array.isArray(multiDayDates) && multiDayDates.length > 0) {
      const result = await createMultiDayBookings(
        session.user.id,
        productId,
        finalOrgId,
        packageId,
        finalPrice,
        isCorporate,
        multiDayDates,
        scheduledAt,
        body,
        prisma
      );
      return NextResponse.json(
        {
          booking: result.booking,
          bookings: result.bookings,
          message: `Multi-day booking created with ${result.bookings.length} dates`,
        },
        { status: 201 }
      );
    }

    // Handle recurring bookings
    if (isRecurring && recurringRule) {
      const result = await createRecurringBookings(
        session.user.id,
        productId,
        finalOrgId,
        packageId,
        finalPrice,
        isCorporate,
        scheduledAt || new Date().toISOString(),
        recurringRule,
        recurringEndDate,
        body,
        prisma
      );
      return NextResponse.json(
        {
          booking: result.booking,
          bookings: result.bookings,
          message: `Recurring booking created with ${result.bookings.length} occurrences`,
        },
        { status: 201 }
      );
    }

    // Determine if this is a quote request (only for corporate users)
    const isQuoteRequest = isCorporate && requestQuote;

    // Create booking in a transaction
    const booking = await prisma.$transaction(async (tx) => {
      // Create the booking
      const newBooking = await tx.booking.create({
        data: {
          bookingNumber,
          customerId: session.user.id,
          productId,
          scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date(), // Use current date if draft
          notes: notes || null,
          orgId: finalOrgId,
          packageId: packageId || null,
          finalPrice,
          status: holdSlot ? 'DRAFT' : bookingStatus, // Hold slots are created as drafts
          isCorporate,
          quoteRequested: isQuoteRequest,
          // Event Details
          contactName: contactName || null,
          contactEmail: contactEmail || null,
          contactPhone: contactPhone || null,
          eventAddress: eventAddress || null,
          eventType: eventType || null,
          eventNotes: eventNotes || null,
          // Event Essentials
          hasPowerSupply: hasPowerSupply || false,
          hasParking: hasParking || false,
          attendeeCount: attendeeCount || null,
          referralSource: referralSource || null,
          // Corporate fields
          poNumber: poNumber || null,
          costCentre: costCentre || null,
          vatRate: vatRate || null,
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
          addOns: {
            include: {
              addOn: true,
            },
          },
        },
      });

      // Create add-ons if provided
      if (addOns && Array.isArray(addOns) && addOns.length > 0) {
        for (const addOnSelection of addOns) {
          const addOn = await tx.addOn.findUnique({
            where: { id: addOnSelection.id, isActive: true },
          });
          if (addOn) {
            await tx.bookingAddOn.create({
              data: {
                bookingId: newBooking.id,
                addOnId: addOn.id,
                quantity: addOnSelection.quantity || 1,
                price: addOn.price,
              },
            });
          }
        }
      }

      // Re-fetch booking with add-ons
      const bookingWithAddOns = await tx.booking.findUnique({
        where: { id: newBooking.id },
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
          addOns: {
            include: {
              addOn: true,
            },
          },
        },
      });

      // Create timeline entry
      let timelineAction = 'CREATED';
      let timelineDetails = 'Booking request submitted - awaiting admin approval for availability';
      
      if (isDraft) {
        timelineAction = 'DRAFT_CREATED';
        timelineDetails = 'Booking draft created';
      } else if (isQuoteRequest) {
        timelineAction = 'QUOTE_REQUESTED';
        timelineDetails = 'Quote request submitted - awaiting admin review and approval';
      }

      await tx.bookingTimeline.create({
        data: {
          bookingId: newBooking.id,
          userId: session.user.id,
          action: timelineAction,
          details: timelineDetails,
        },
      });

      // Create notifications for admins about new booking requests (non-drafts)
      if (!isDraft) {
        const admins = await tx.user.findMany({
          where: {
            role: 'ADMIN',
          },
          select: {
            id: true,
          },
        });

        // Create in-app notifications for all admins
        const notificationSubject = isQuoteRequest ? 'New Quote Request' : 'New Booking Request';
        const notificationMessage = isQuoteRequest 
          ? `New quote request ${newBooking.bookingNumber} from corporate customer. Amount: $${finalPrice.toFixed(2)}`
          : `New booking ${newBooking.bookingNumber} requires approval. Amount: $${finalPrice.toFixed(2)}`;
        const notificationType = isQuoteRequest ? 'quote_request' : 'booking_request';

        await Promise.all(
          admins.map((admin) =>
            tx.notification.create({
              data: {
                userId: admin.id,
                type: 'IN_APP',
                subject: notificationSubject,
                message: notificationMessage,
                metadata: {
                  bookingId: newBooking.id,
                  bookingNumber: newBooking.bookingNumber,
                  type: notificationType,
                },
              },
            })
          )
        );
      }

      // Note: Package credits should be deducted when admin confirms the booking, not here
      // We'll keep package validation but defer credit deduction to the confirmation endpoint

      return bookingWithAddOns || newBooking;
    });

    // Handle response for bulk/multi-day/recurring bookings
    if (isBulkBooking && Array.isArray(bulkLocations) && bulkLocations.length > 0) {
      const result = await createBulkBookings(
        session.user.id,
        productId,
        finalOrgId,
        packageId,
        finalPrice,
        isCorporate,
        bulkLocations,
        body,
        prisma
      );
      return NextResponse.json(
        {
          booking: result.booking,
          bookings: result.bookings,
          bookingGroup: result.bookingGroup,
          message: `Bulk booking created with ${result.bookings.length} locations`,
        },
        { status: 201 }
      );
    }

    if (isMultiDay && Array.isArray(multiDayDates) && multiDayDates.length > 0) {
      const result = await createMultiDayBookings(
        session.user.id,
        productId,
        finalOrgId,
        packageId,
        finalPrice,
        isCorporate,
        multiDayDates,
        scheduledAt,
        body,
        prisma
      );
      return NextResponse.json(
        {
          booking: result.booking,
          bookings: result.bookings,
          message: `Multi-day booking created with ${result.bookings.length} dates`,
        },
        { status: 201 }
      );
    }

    if (isRecurring && recurringRule) {
      const result = await createRecurringBookings(
        session.user.id,
        productId,
        finalOrgId,
        packageId,
        finalPrice,
        isCorporate,
        scheduledAt || new Date().toISOString(),
        recurringRule,
        recurringEndDate,
        body,
        prisma
      );
      return NextResponse.json(
        {
          booking: result.booking,
          bookings: result.bookings,
          message: `Recurring booking created with ${result.bookings.length} occurrences`,
        },
        { status: 201 }
      );
    }

    let successMessage = 'Booking request submitted successfully. An admin will review and confirm availability shortly.';
    if (isDraft) {
      successMessage = 'Booking draft created successfully';
    } else if (isQuoteRequest) {
      successMessage = 'Quote request submitted successfully. An admin will review and approve your quote with payment terms.';
    }

    return NextResponse.json(
      {
        booking,
        message: successMessage,
        isQuoteRequest,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Booking creation error:', error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}

export async function GET(_request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's bookings
    const bookings = await prisma.booking.findMany({
      where: {
        customerId: session.user.id,
      },
      include: {
        product: true,
        assignedStaff: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        org: true,
        package: true,
      },
      orderBy: {
        scheduledAt: 'desc',
      },
    });

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('Fetch bookings error:', error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}
