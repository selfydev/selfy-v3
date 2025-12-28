import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hasRole } from '@/lib/guards';
import { uploadToCloudinary } from '@/lib/cloudinary';

// GET /api/admin/templates/[id] - Get a specific template (admin view)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has ADMIN or STAFF role
    if (!hasRole(session.user.role, 'STAFF') && !hasRole(session.user.role, 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id: templateId } = await params;

    const template = await prisma.designTemplate.findUnique({
      where: { id: templateId },
      include: {
        booking: {
          include: {
            customer: {
              select: {
                name: true,
                email: true,
              },
            },
            product: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    return NextResponse.json(template);
  } catch (error) {
    console.error('Error fetching template:', error);
    return NextResponse.json({ error: 'Failed to fetch template' }, { status: 500 });
  }
}

// PATCH /api/admin/templates/[id] - Update a template (admin edit)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has ADMIN or STAFF role
    if (!hasRole(session.user.role, 'STAFF') && !hasRole(session.user.role, 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id: templateId } = await params;
    const body = await request.json();
    const { canvasData, thumbnailBase64 } = body;

    if (!canvasData) {
      return NextResponse.json({ error: 'Missing required field: canvasData' }, { status: 400 });
    }

    // Check if template exists
    const existingTemplate = await prisma.designTemplate.findUnique({
      where: { id: templateId },
    });

    if (!existingTemplate) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Upload new thumbnail if provided
    let thumbnailUrl = existingTemplate.thumbnailUrl;
    if (thumbnailBase64) {
      const uploadResult = await uploadToCloudinary(thumbnailBase64, {
        folder: 'thumbnails',
        userId: session.user.id,
      });
      thumbnailUrl = uploadResult.url;
    }

    // Update template
    const updatedTemplate = await prisma.designTemplate.update({
      where: { id: templateId },
      data: {
        canvasData,
        thumbnailUrl,
      },
      include: {
        booking: {
          include: {
            customer: {
              select: {
                name: true,
                email: true,
              },
            },
            product: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(updatedTemplate);
  } catch (error) {
    console.error('Error updating template:', error);
    return NextResponse.json({ error: 'Failed to update template' }, { status: 500 });
  }
}
