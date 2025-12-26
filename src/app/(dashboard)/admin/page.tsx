import { requireRole } from '@/lib/guards';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Plus, Building2, Package, Clock, FileText, CheckCircle, ClipboardList } from 'lucide-react';

export default async function AdminPage() {
  const user = await requireRole('ADMIN', '/dashboard');

  const [productsCount, orgsCount, packagesCount, quoteRequestsCount, pendingBookingsCount] = await Promise.all([
    prisma.product.count(),
    prisma.corporateOrg.count(),
    prisma.corporatePackage.count(),
    prisma.booking.count({ where: { quoteRequested: true } }),
    prisma.booking.count({ where: { status: 'PENDING', quoteRequested: false } }),
  ]);

  const totalActionRequired = quoteRequestsCount + pendingBookingsCount;

  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-6">
      {/* Action Required Alert */}
      {totalActionRequired > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base">Action Required</CardTitle>
              <Badge variant="secondary" className="ml-auto">
                {totalActionRequired}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              You have {totalActionRequired} item{totalActionRequired !== 1 ? 's' : ''} that need{totalActionRequired === 1 ? 's' : ''} your attention.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Priority Actions - Pending Items */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <CardDescription>Pending Approval</CardDescription>
              </div>
              {pendingBookingsCount > 0 && (
                <Badge>
                  {pendingBookingsCount}
                </Badge>
              )}
            </div>
            <CardTitle className="text-3xl">{pendingBookingsCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Bookings awaiting approval</p>
            <Link
              href="/admin/bookings"
              className="mt-3 inline-flex text-sm font-medium text-primary hover:underline"
            >
              Review Bookings →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <CardDescription>Quote Requests</CardDescription>
              </div>
              {quoteRequestsCount > 0 && (
                <Badge>
                  {quoteRequestsCount}
                </Badge>
              )}
            </div>
            <CardTitle className="text-3xl">{quoteRequestsCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Corporate quotes pending approval</p>
            <Link
              href="/admin/bookings/quotes"
              className="mt-3 inline-flex text-sm font-medium text-primary hover:underline"
            >
              Review Quotes →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
              <CardDescription>All Bookings</CardDescription>
            </div>
            <CardTitle className="text-3xl">
              <ClipboardList className="h-8 w-8 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">View, search, and export all bookings</p>
            <Link
              href="/admin/bookings/all"
              className="mt-3 inline-flex text-sm font-medium text-primary hover:underline"
            >
              Browse All →
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Catalog Management */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <CardDescription>Products</CardDescription>
            </div>
            <CardTitle className="text-3xl">{productsCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <Link
              href="/admin/products"
              className="inline-flex text-sm font-medium text-primary hover:underline"
            >
              Manage Products →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <CardDescription>Organizations</CardDescription>
            </div>
            <CardTitle className="text-3xl">{orgsCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <Link
              href="/admin/corporate-orgs"
              className="inline-flex text-sm font-medium text-primary hover:underline"
            >
              Manage Organizations →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <CardDescription>Corporate Packages</CardDescription>
            </div>
            <CardTitle className="text-3xl">{packagesCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <Link
              href="/admin/corporate-packages"
              className="inline-flex text-sm font-medium text-primary hover:underline"
            >
              Manage Packages →
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/admin/products/new"
              className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-accent"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Plus className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-medium">Create Product</h3>
                <p className="text-sm text-muted-foreground">Add new service</p>
              </div>
            </Link>

            <Link
              href="/admin/corporate-orgs/new"
              className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-accent"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Building2 className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-medium">Create Organization</h3>
                <p className="text-sm text-muted-foreground">Add corporate client</p>
              </div>
            </Link>

            <Link
              href="/admin/corporate-packages/new"
              className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-accent"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Package className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-medium">Create Package</h3>
                <p className="text-sm text-muted-foreground">Add credit bundle</p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Admin Info */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Email:</span> {user.email}
          </p>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Role:</span> {user.role}
          </p>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">User ID:</span> {user.id}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
