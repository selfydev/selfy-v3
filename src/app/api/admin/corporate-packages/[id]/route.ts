import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hasRole } from '@/lib/guards';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasRole(session.user.role, 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { id } = await params;
    const corporatePackage = await prisma.corporatePackage.findUnique({
      where: { id },
      include: {
        org: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            bookings: true,
          },
        },
      },
    });

    if (!corporatePackage) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 });
    }

    return NextResponse.json({ package: corporatePackage });
  } catch (error) {
    console.error('Fetch package error:', error);
    return NextResponse.json({ error: 'Failed to fetch package' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasRole(session.user.role, 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { id } = await params;
    const existingPackage = await prisma.corporatePackage.findUnique({
      where: { id },
    });

    if (!existingPackage) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 });
    }

    const body = await request.json();
    const {
      name,
      description,
      totalCredits,
      usedCredits,
      permanentDiscountPercent,
      customPricing,
      expiresAt,
      isActive,
    } = body;

    // Validation
    if (name !== undefined && (!name || !name.trim())) {
      return NextResponse.json({ error: 'Package name cannot be empty' }, { status: 400 });
    }

    if (totalCredits !== undefined && totalCredits <= 0) {
      return NextResponse.json({ error: 'Total credits must be greater than 0' }, { status: 400 });
    }

    if (usedCredits !== undefined && usedCredits < 0) {
      return NextResponse.json({ error: 'Used credits cannot be negative' }, { status: 400 });
    }

    if (
      permanentDiscountPercent !== undefined &&
      (permanentDiscountPercent < 0 || permanentDiscountPercent > 100)
    ) {
      return NextResponse.json(
        { error: 'Discount percent must be between 0 and 100' },
        { status: 400 }
      );
    }

    // Build update data object
    const updateData: any = {};

    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (totalCredits !== undefined) updateData.totalCredits = parseInt(totalCredits);
    if (usedCredits !== undefined) updateData.usedCredits = parseInt(usedCredits);
    if (permanentDiscountPercent !== undefined)
      updateData.permanentDiscountPercent = parseFloat(permanentDiscountPercent);
    if (customPricing !== undefined) updateData.customPricing = customPricing || null;
    if (expiresAt !== undefined) updateData.expiresAt = expiresAt ? new Date(expiresAt) : null;
    if (isActive !== undefined) updateData.isActive = isActive;

    const corporatePackage = await prisma.corporatePackage.update({
      where: { id },
      data: updateData,
      include: {
        org: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      package: corporatePackage,
      message: 'Corporate package updated successfully',
    });
  } catch (error) {
    console.error('Package update error:', error);
    return NextResponse.json({ error: 'Failed to update package' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasRole(session.user.role, 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { id } = await params;
    const existingPackage = await prisma.corporatePackage.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            bookings: true,
          },
        },
      },
    });

    if (!existingPackage) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 });
    }

    if (existingPackage._count.bookings > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete package with existing bookings. Deactivate it instead.',
          bookingsCount: existingPackage._count.bookings,
        },
        { status: 400 }
      );
    }

    await prisma.corporatePackage.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'Corporate package deleted successfully',
    });
  } catch (error) {
    console.error('Package deletion error:', error);
    return NextResponse.json({ error: 'Failed to delete package' }, { status: 500 });
  }
}
