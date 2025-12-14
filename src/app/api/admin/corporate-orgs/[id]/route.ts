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
    const org = await prisma.corporateOrg.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        admins: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        seats: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        packages: true,
        _count: {
          select: {
            bookings: true,
          },
        },
      },
    });

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    return NextResponse.json({ org });
  } catch (error) {
    console.error('Fetch org error:', error);
    return NextResponse.json({ error: 'Failed to fetch organization' }, { status: 500 });
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
    const existingOrg = await prisma.corporateOrg.findUnique({
      where: { id },
    });

    if (!existingOrg) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    const body = await request.json();
    const { name, email, phone, address, logoUrl, maxSeats, discountPercent, isActive } = body;

    // Validation
    if (name !== undefined && (!name || !name.trim())) {
      return NextResponse.json({ error: 'Organization name cannot be empty' }, { status: 400 });
    }

    if (maxSeats !== undefined && maxSeats <= 0) {
      return NextResponse.json({ error: 'Max seats must be greater than 0' }, { status: 400 });
    }

    if (discountPercent !== undefined && (discountPercent < 0 || discountPercent > 100)) {
      return NextResponse.json(
        { error: 'Discount percent must be between 0 and 100' },
        { status: 400 }
      );
    }

    // Build update data object
    const updateData: any = {};

    if (name !== undefined) updateData.name = name.trim();
    if (email !== undefined) updateData.email = email?.trim() || null;
    if (phone !== undefined) updateData.phone = phone?.trim() || null;
    if (address !== undefined) updateData.address = address?.trim() || null;
    if (logoUrl !== undefined) updateData.logoUrl = logoUrl?.trim() || null;
    if (maxSeats !== undefined) updateData.maxSeats = parseInt(maxSeats);
    if (discountPercent !== undefined) updateData.discountPercent = parseFloat(discountPercent);
    if (isActive !== undefined) updateData.isActive = isActive;

    const org = await prisma.corporateOrg.update({
      where: { id },
      data: updateData,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      org,
      message: 'Corporate organization updated successfully',
    });
  } catch (error) {
    console.error('Org update error:', error);
    return NextResponse.json({ error: 'Failed to update organization' }, { status: 500 });
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
    const existingOrg = await prisma.corporateOrg.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            packages: true,
            bookings: true,
            seats: true,
          },
        },
      },
    });

    if (!existingOrg) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    if (existingOrg._count.bookings > 0 || existingOrg._count.packages > 0) {
      return NextResponse.json(
        {
          error:
            'Cannot delete organization with existing bookings or packages. Deactivate it instead.',
          bookingsCount: existingOrg._count.bookings,
          packagesCount: existingOrg._count.packages,
        },
        { status: 400 }
      );
    }

    await prisma.corporateOrg.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'Corporate organization deleted successfully',
    });
  } catch (error) {
    console.error('Org deletion error:', error);
    return NextResponse.json({ error: 'Failed to delete organization' }, { status: 500 });
  }
}
