import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hasRole } from '@/lib/guards';

// GET /api/admin/automation-logs - Get execution logs
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !hasRole(session.user.role, 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const ruleId = searchParams.get('ruleId');
    const limit = parseInt(searchParams.get('limit') || '50');

    const logs = await prisma.automationLog.findMany({
      where: ruleId ? { ruleId } : {},
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        rule: {
          select: {
            name: true,
            trigger: true,
          },
        },
      },
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching automation logs:', error);
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
  }
}
