import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hasRole } from '@/lib/guards';

export async function GET() {
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/dc8094a1-3080-4382-9ce1-ab0b69e272ba',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'dashboard-counts:entry',message:'Dashboard counts API called',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'D'})}).catch(()=>{});
  // #endregion
  try {
    const session = await getServerSession(authOptions);
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/dc8094a1-3080-4382-9ce1-ab0b69e272ba',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'dashboard-counts:session',message:'Session fetched',data:{hasSession:!!session,userRole:session?.user?.role},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'D'})}).catch(()=>{});
    // #endregion

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has ADMIN or STAFF role
    if (!hasRole(session.user.role, 'STAFF') && !hasRole(session.user.role, 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get counts for pending items
    const [pendingBookings, quoteRequests] = await Promise.all([
      // Pending bookings that need approval (paid but not confirmed)
      prisma.booking.count({
        where: {
          status: 'PENDING',
          quoteRequested: false,
        },
      }),
      // Quote requests waiting for approval
      prisma.booking.count({
        where: {
          quoteRequested: true,
        },
      }),
    ]);

    return NextResponse.json({
      pendingBookings,
      quoteRequests,
    });
  } catch (error) {
    console.error('Dashboard counts error:', error);
    return NextResponse.json({ error: 'Failed to fetch counts' }, { status: 500 });
  }
}

