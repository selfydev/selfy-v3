import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hasRole } from '@/lib/guards';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasRole(session.user.role, 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');

    const whereClause: any = {};

    if (isActive !== null) {
      whereClause.isActive = isActive === 'true';
    }

    const orgs = await prisma.corporateOrg.findMany({
      where: whereClause,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            admins: true,
            seats: true,
            packages: true,
            bookings: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ orgs });
  } catch (error) {
    console.error('Fetch orgs error:', error);
    return NextResponse.json({ error: 'Failed to fetch organizations' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasRole(session.user.role, 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { name, email, phone, address, logoUrl, maxSeats, discountPercent, ownerId, isActive } =
      body;

    // Validation
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Organization name is required' }, { status: 400 });
    }

    if (!ownerId) {
      return NextResponse.json({ error: 'Owner ID is required' }, { status: 400 });
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

    // Verify owner exists
    const owner = await prisma.user.findUnique({
      where: { id: ownerId },
    });

    if (!owner) {
      return NextResponse.json({ error: 'Owner user not found' }, { status: 404 });
    }

    const org = await prisma.corporateOrg.create({
      data: {
        name: name.trim(),
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        address: address?.trim() || null,
        logoUrl: logoUrl?.trim() || null,
        maxSeats: maxSeats !== undefined ? parseInt(maxSeats) : 10,
        discountPercent: discountPercent !== undefined ? parseFloat(discountPercent) : 0,
        ownerId,
        isActive: isActive !== undefined ? isActive : true,
      },
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

    return NextResponse.json(
      {
        org,
        message: 'Corporate organization created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Org creation error:', error);
    return NextResponse.json({ error: 'Failed to create organization' }, { status: 500 });
  }
}
