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

    // Check if user has ADMIN role
    if (!hasRole(session.user.role, 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Parse query parameters for filtering
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');

    const whereClause: any = {};

    if (isActive !== null) {
      whereClause.isActive = isActive === 'true';
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
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

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Fetch products error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has ADMIN role
    if (!hasRole(session.user.role, 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, price, duration, isActive } = body;

    // Validation
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Product name is required' }, { status: 400 });
    }

    if (price === undefined || price < 0) {
      return NextResponse.json({ error: 'Valid price is required' }, { status: 400 });
    }

    if (!duration || duration <= 0) {
      return NextResponse.json(
        { error: 'Valid duration (in minutes) is required' },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        price: parseFloat(price),
        duration: parseInt(duration),
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json(
      {
        product,
        message: 'Product created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Product creation error:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
