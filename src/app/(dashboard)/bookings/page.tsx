import { getCurrentUser } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarPlus, Calendar, Palette, ArrowRight } from 'lucide-react';

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-purple-100 text-purple-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  NO_SHOW: 'bg-gray-100 text-gray-800',
  INVOICED: 'bg-indigo-100 text-indigo-800',
};

export default async function BookingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/auth/signin');
  }

  // Fetch user's bookings (exclude drafts - they're just temporary saves)
  const bookings = await prisma.booking.findMany({
    where: {
      customerId: user.id,
      status: {
        not: 'DRAFT',
      },
    },
    include: {
      product: {
        select: {
          name: true,
        },
      },
      designTemplate: {
        select: {
          id: true,
        },
      },
    },
    orderBy: {
      scheduledAt: 'desc',
    },
  });

  // Split into upcoming and past
  const now = new Date();
  const upcomingBookings = bookings.filter(
    (b) => new Date(b.scheduledAt) >= now && !['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(b.status)
  );
  const pastBookings = bookings.filter(
    (b) => new Date(b.scheduledAt) < now || ['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(b.status)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Bookings</h1>
          <p className="text-muted-foreground">Manage your photo booth bookings</p>
        </div>
        <Button asChild>
          <Link href="/products">
            <CalendarPlus className="mr-2 h-4 w-4" />
            New Booking
          </Link>
        </Button>
      </div>

      {/* No bookings */}
      {bookings.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Bookings Yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              You haven't made any bookings yet. Browse our products to get started!
            </p>
            <Button asChild>
              <Link href="/products">
                Browse Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Bookings */}
      {upcomingBookings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Bookings</CardTitle>
            <CardDescription>Your scheduled events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{booking.product.name}</p>
                      <Badge className={statusColors[booking.status]}>
                        {booking.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(booking.scheduledAt).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Booking #{booking.bookingNumber} • ${booking.finalPrice.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {booking.status === 'CONFIRMED' && !booking.designTemplate && (
                      <Button asChild size="sm">
                        <Link href={`/bookings/${booking.id}/template`}>
                          <Palette className="mr-2 h-4 w-4" />
                          Create Template
                        </Link>
                      </Button>
                    )}
                    {booking.status === 'CONFIRMED' && booking.designTemplate && (
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/bookings/${booking.id}/template`}>
                          Edit Template
                        </Link>
                      </Button>
                    )}
                    <Button asChild size="sm" variant="ghost">
                      <Link href={`/bookings/${booking.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Past Bookings */}
      {pastBookings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Past Bookings</CardTitle>
            <CardDescription>Your booking history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pastBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{booking.product.name}</p>
                      <Badge className={statusColors[booking.status]}>
                        {booking.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(booking.scheduledAt).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Booking #{booking.bookingNumber} • ${booking.finalPrice.toFixed(2)}
                    </p>
                  </div>
                  <Button asChild size="sm" variant="ghost">
                    <Link href={`/bookings/${booking.id}`}>
                      View Details
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

