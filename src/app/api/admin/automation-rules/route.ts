import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hasRole } from '@/lib/guards';

// GET /api/admin/automation-rules - List all rules
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !hasRole(session.user.role, 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rules = await prisma.automationRule.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { logs: true },
        },
      },
    });

    return NextResponse.json(rules);
  } catch (error) {
    console.error('Error fetching automation rules:', error);
    return NextResponse.json({ error: 'Failed to fetch rules' }, { status: 500 });
  }
}

// POST /api/admin/automation-rules - Create new rule
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !hasRole(session.user.role, 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, trigger, conditions, actions, isActive } = body;

    const rule = await prisma.automationRule.create({
      data: {
        name,
        description,
        trigger,
        conditions: conditions || {},
        actions: actions || [],
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json(rule, { status: 201 });
  } catch (error) {
    console.error('Error creating automation rule:', error);
    return NextResponse.json({ error: 'Failed to create rule' }, { status: 500 });
  }
}
