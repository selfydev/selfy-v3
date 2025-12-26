import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hasRole } from '@/lib/guards';

interface SeatRouteParams {
  params: Promise<{
    id: string;
  }>;
}

// POST - Add a user to the organization (assign a seat)
export async function POST(request: Request, { params }: SeatRouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasRole(session.user.role, 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Get the organization
    const org = await prisma.corporateOrg.findUnique({
      where: { id },
      include: {
        seats: true,
      },
    });

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Check if seat limit is reached
    if (org.seats.length >= org.maxSeats) {
      return NextResponse.json(
        { error: `Organization has reached maximum seats (${org.maxSeats})` },
        { status: 400 }
      );
    }

    // Check if user already has a seat
    const existingSeat = org.seats.find((seat) => seat.userId === userId);
    if (existingSeat) {
      return NextResponse.json(
        { error: 'User already has a seat in this organization' },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create the seat
    const seat = await prisma.orgSeat.create({
      data: {
        orgId: id,
        userId,
        isActive: true,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ seat, message: 'User added to organization successfully' }, { status: 201 });
  } catch (error: any) {
    console.error('Add seat error:', error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'User already has a seat in this organization' },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Failed to add user to organization' }, { status: 500 });
  }
}

// DELETE - Remove a user from the organization (remove a seat)
export async function DELETE(request: Request, { params }: SeatRouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasRole(session.user.role, 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Find and delete the seat
    const seat = await prisma.orgSeat.findUnique({
      where: {
        orgId_userId: {
          orgId: id,
          userId,
        },
      },
    });

    if (!seat) {
      return NextResponse.json({ error: 'Seat not found' }, { status: 404 });
    }

    await prisma.orgSeat.delete({
      where: {
        id: seat.id,
      },
    });

    return NextResponse.json({ message: 'User removed from organization successfully' }, { status: 200 });
  } catch (error) {
    console.error('Remove seat error:', error);
    return NextResponse.json({ error: 'Failed to remove user from organization' }, { status: 500 });
  }
}
