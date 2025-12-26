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
    const orgId = searchParams.get('orgId');
    const isActive = searchParams.get('isActive');

    const whereClause: any = {};

    if (orgId) {
      whereClause.orgId = orgId;
    }

    if (isActive !== null) {
      whereClause.isActive = isActive === 'true';
    }

    const packages = await prisma.corporatePackage.findMany({
      where: whereClause,
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ packages });
  } catch (error) {
    console.error('Fetch packages error:', error);
    return NextResponse.json({ error: 'Failed to fetch packages' }, { status: 500 });
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
    const {
      orgId,
      name,
      description,
      totalCredits,
      permanentDiscountPercent,
      customPricing,
      expiresAt,
      isActive,
    } = body;

    // Validation
    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 });
    }

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Package name is required' }, { status: 400 });
    }

    if (!totalCredits || totalCredits <= 0) {
      return NextResponse.json({ error: 'Valid total credits is required' }, { status: 400 });
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

    // Verify org exists
    const org = await prisma.corporateOrg.findUnique({
      where: { id: orgId },
    });

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    const corporatePackage = await prisma.corporatePackage.create({
      data: {
        orgId,
        name: name.trim(),
        description: description?.trim() || null,
        totalCredits: parseInt(totalCredits),
        permanentDiscountPercent:
          permanentDiscountPercent !== undefined ? parseFloat(permanentDiscountPercent) : 0,
        customPricing: customPricing || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: isActive !== undefined ? isActive : true,
      },
      include: {
        org: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        package: corporatePackage,
        message: 'Corporate package created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Package creation error:', error);
    return NextResponse.json({ error: 'Failed to create package' }, { status: 500 });
  }
}
