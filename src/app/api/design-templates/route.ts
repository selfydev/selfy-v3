import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { DesignTemplate } from '@prisma/client';
import { inngest } from '@/lib/inngest/client';

// Helper: Check if template is locked (2 hours before event)
function isTemplateLocked(scheduledAt: Date): boolean {
  const lockTime = new Date(scheduledAt);
  lockTime.setHours(lockTime.getHours() - 2);
  return new Date() >= lockTime;
}

// GET /api/design-templates - Get templates (system templates + user's own)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('bookingId');
    const systemOnly = searchParams.get('systemOnly') === 'true';

    // If requesting for a specific booking, return that template with lock status
    if (bookingId) {
      const template = await prisma.designTemplate.findFirst({
        where: {
          bookingId,
          booking: {
            customerId: session.user.id,
          },
        },
        include: {
          booking: {
            select: {
              scheduledAt: true,
            },
          },
        },
      });

      if (!template || !template.booking) {
        return NextResponse.json(null);
      }

      // Calculate lock status
      const isLocked = isTemplateLocked(template.booking.scheduledAt);

      return NextResponse.json({
        ...template,
        isLocked,
      });
    }

    // Get system templates (starter templates)
    const systemTemplates = await prisma.designTemplate.findMany({
      where: {
        isSystemTemplate: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    if (systemOnly) {
      return NextResponse.json(systemTemplates);
    }

    // Get user's own templates
    const userTemplates = await prisma.designTemplate.findMany({
      where: {
        userId: session.user.id,
        isSystemTemplate: false,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      systemTemplates,
      userTemplates,
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
  }
}

// POST /api/design-templates - Create or update a template for a booking
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { bookingId, name, canvasData, thumbnailBase64 } = body;

    if (!bookingId || !canvasData) {
      return NextResponse.json(
        { error: 'Missing required fields: bookingId, canvasData' },
        { status: 400 }
      );
    }

    // Verify the booking belongs to this user and is confirmed
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        customerId: session.user.id,
        status: { in: ['CONFIRMED', 'COMPLETED'] },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found or not confirmed' },
        { status: 404 }
      );
    }

    // Check if template is locked (2 hours before event)
    if (isTemplateLocked(booking.scheduledAt)) {
      return NextResponse.json(
        { error: 'Template is locked. Changes cannot be made within 2 hours of the event.' },
        { status: 403 }
      );
    }

    // Upload thumbnail if provided
    let thumbnailUrl: string | undefined;
    if (thumbnailBase64) {
      const uploadResult = await uploadToCloudinary(thumbnailBase64, {
        folder: 'thumbnails',
        userId: session.user.id,
      });
      thumbnailUrl = uploadResult.url;
    }

    // Check if template already exists for this booking
    const existingTemplate = await prisma.designTemplate.findFirst({
      where: { bookingId },
    });

    let template: DesignTemplate;
    if (existingTemplate) {
      // Update existing template
      template = await prisma.designTemplate.update({
        where: { id: existingTemplate.id },
        data: {
          name: name || existingTemplate.name,
          canvasData,
          thumbnailUrl: thumbnailUrl || existingTemplate.thumbnailUrl,
        },
      });
    } else {
      // Create new template and mark booking as submitted
      template = await prisma.designTemplate.create({
        data: {
          name: name || `Template for Booking ${booking.bookingNumber}`,
          userId: session.user.id,
          bookingId,
          canvasData,
          thumbnailUrl,
          isSystemTemplate: false,
          isPremium: false,
        },
      });

      // Mark booking as completed with template submitted (first submission only)
      if (!booking.templateSubmitted) {
        await prisma.booking.update({
          where: { id: bookingId },
          data: {
            templateSubmitted: true,
            templateSubmittedAt: new Date(),
            status: 'COMPLETED', // Mark booking as complete
          },
        });

        // Create notification for admins about template submission
        const admins = await prisma.user.findMany({
          where: {
            role: { in: ['ADMIN', 'STAFF'] },
          },
        });

        // Create notifications for all admins
        await prisma.notification.createMany({
          data: admins.map((admin) => ({
            userId: admin.id,
            type: 'IN_APP',
            status: 'PENDING',
            subject: 'New Template Submitted',
            message: `Customer ${session.user.name || session.user.email} has submitted a template for booking #${booking.bookingNumber}`,
            metadata: {
              bookingId,
              templateId: template.id,
              bookingNumber: booking.bookingNumber,
            },
          })),
        });

        // Emit Inngest event for template submission
        try {
          await inngest.send({
            name: 'template/submitted',
            data: {
              bookingId,
              bookingNumber: booking.bookingNumber,
              customerId: session.user.id,
              templateId: template.id,
              submittedAt: new Date().toISOString(),
            },
          });
        } catch (error) {
          console.error('Failed to emit template/submitted event:', error);
          // Don't fail the template submission if event emission fails
        }
      }
    }

    return NextResponse.json(template, { status: existingTemplate ? 200 : 201 });
  } catch (error) {
    console.error('Error saving template:', error);
    return NextResponse.json({ error: 'Failed to save template' }, { status: 500 });
  }
}

