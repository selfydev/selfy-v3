import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { SectionCards } from "@/components/section-cards"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { getCurrentUser } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Palette, Calendar, ArrowRight, CalendarPlus, Sparkles, CheckCircle2, Bell, PartyPopper } from "lucide-react"

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/auth/signin');
  }

  // Fetch user's confirmed bookings that need templates
  const confirmedBookings = await prisma.booking.findMany({
    where: {
      customerId: user.id,
      status: 'CONFIRMED',
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
      scheduledAt: 'asc',
    },
    take: 5,
  });

  // Check if user has any bookings at all (exclude drafts)
  const totalBookings = await prisma.booking.count({
    where: {
      customerId: user.id,
      status: {
        not: 'DRAFT',
      },
    },
  });

  // Fetch recently confirmed bookings (within last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const recentlyConfirmedBookings = await prisma.booking.findMany({
    where: {
      customerId: user.id,
      status: 'CONFIRMED',
      updatedAt: {
        gte: sevenDaysAgo,
      },
    },
    include: {
      product: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
    take: 3,
  });

  // Fetch unread notifications
  const unreadNotifications = await prisma.notification.findMany({
    where: {
      userId: user.id,
      readAt: null,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 5,
  });

  // Filter bookings without templates
  const bookingsNeedingTemplates = confirmedBookings.filter(
    (booking) => !booking.designTemplate
  );

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      {/* Recently Confirmed Bookings - Prominent Banner */}
      {recentlyConfirmedBookings.length > 0 && (
        <Card className="border-green-500/30 bg-gradient-to-r from-green-500/10 via-green-500/5 to-emerald-500/10 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-500/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <CardContent className="relative pt-6">
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-green-500/20 p-3 flex-shrink-0">
                <PartyPopper className="h-8 w-8 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold text-green-700 dark:text-green-400">
                    Booking{recentlyConfirmedBookings.length > 1 ? 's' : ''} Confirmed!
                  </h2>
                  <Badge className="bg-green-500 text-white">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Confirmed
                  </Badge>
                </div>
                <p className="text-muted-foreground mb-4">
                  Great news! Your booking{recentlyConfirmedBookings.length > 1 ? 's have' : ' has'} been confirmed. 
                  You can now create custom photo booth templates for your event{recentlyConfirmedBookings.length > 1 ? 's' : ''}.
                </p>
                <div className="flex flex-wrap gap-3">
                  {recentlyConfirmedBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center gap-2 bg-white/50 dark:bg-gray-800/50 rounded-lg px-3 py-2 border border-green-500/20">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="font-medium text-sm">{booking.product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(booking.scheduledAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      <Button asChild size="sm" variant="outline" className="ml-2 border-green-500/30 hover:bg-green-500/10">
                        <Link href={`/bookings/${booking.id}/template`}>
                          <Palette className="h-3 w-3 mr-1" />
                          Design
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Unread Notifications */}
      {unreadNotifications.length > 0 && (
        <Alert className="border-blue-500/20 bg-blue-500/5">
          <Bell className="h-5 w-5 text-blue-500" />
          <AlertTitle className="flex items-center gap-2">
            New Notifications
            <Badge variant="secondary" className="text-xs">
              {unreadNotifications.length} unread
            </Badge>
          </AlertTitle>
          <AlertDescription className="mt-2">
            <div className="space-y-2">
              {unreadNotifications.slice(0, 3).map((notification) => (
                <div key={notification.id} className="text-sm">
                  <p className="font-medium">{notification.subject}</p>
                  <p className="text-muted-foreground text-xs">{notification.message}</p>
                </div>
              ))}
              {unreadNotifications.length > 3 && (
                <Button asChild size="sm" variant="link" className="p-0 h-auto">
                  <Link href="/dashboard/notifications">
                    View all notifications
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Welcome CTA for new users / users with no bookings */}
      {totalBookings === 0 && (
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
          <CardContent className="flex flex-col md:flex-row items-center gap-6 pt-6">
            <div className="flex-shrink-0">
              <div className="rounded-full bg-primary/10 p-4">
                <Sparkles className="h-10 w-10 text-primary" />
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-xl font-bold mb-2">Welcome to Selfy! 🎉</h2>
              <p className="text-muted-foreground mb-4">
                Ready to make your event unforgettable? Book a photo booth experience and create custom templates for your guests.
              </p>
              <Button asChild size="lg">
                <Link href="/products">
                  <CalendarPlus className="mr-2 h-5 w-5" />
                  Book Your First Experience
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Template Creation Alert */}
      {bookingsNeedingTemplates.length > 0 && (
        <Alert className="border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5">
          <Palette className="h-5 w-5 text-primary" />
          <AlertTitle className="text-lg">Create Your Photo Booth Templates!</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="text-muted-foreground mb-3">
              You have {bookingsNeedingTemplates.length} confirmed booking{bookingsNeedingTemplates.length !== 1 ? 's' : ''} ready for template design.
            </p>
            <div className="flex flex-wrap gap-2">
              {bookingsNeedingTemplates.slice(0, 3).map((booking) => (
                <Button key={booking.id} asChild size="sm" variant="outline">
                  <Link href={`/bookings/${booking.id}/template`}>
                    <Palette className="mr-2 h-4 w-4" />
                    {booking.product.name}
                  </Link>
                </Button>
              ))}
              {bookingsNeedingTemplates.length > 3 && (
                <Button asChild size="sm" variant="ghost">
                  <Link href="/bookings">
                    +{bookingsNeedingTemplates.length - 3} more
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <SectionCards />
      
      <div className="px-0 lg:px-0">
        <ChartAreaInteractive />
      </div>

      {/* Upcoming Confirmed Bookings */}
      {confirmedBookings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Confirmed Bookings
            </CardTitle>
            <CardDescription>
              Your upcoming events - create templates before your event date
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {confirmedBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{booking.product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(booking.scheduledAt).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Booking #{booking.bookingNumber}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {booking.designTemplate ? (
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/bookings/${booking.id}/template`}>
                          Edit Template
                        </Link>
                      </Button>
                    ) : (
                      <Button asChild size="sm">
                        <Link href={`/bookings/${booking.id}/template`}>
                          <Palette className="mr-2 h-4 w-4" />
                          Create Template
                        </Link>
                      </Button>
                    )}
                    <Button asChild size="sm" variant="ghost">
                      <Link href={`/bookings/${booking.id}`}>
                        View
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Get started quickly with these common actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            <Link 
              href="/products"
              className="rounded-lg border border-primary/20 bg-primary/5 p-4 hover:bg-primary/10 transition-colors group"
            >
              <div className="flex items-center gap-3 mb-2">
                <CalendarPlus className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Book Now</h3>
              </div>
              <p className="text-sm text-muted-foreground">Browse products and book your experience</p>
            </Link>
            <Link 
              href="/bookings"
              className="rounded-lg border p-4 hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-medium">My Bookings</h3>
              </div>
              <p className="text-sm text-muted-foreground">View and manage your bookings</p>
            </Link>
            <Link 
              href="/settings"
              className="rounded-lg border p-4 hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <Palette className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-medium">Settings</h3>
              </div>
              <p className="text-sm text-muted-foreground">Manage your account settings</p>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
