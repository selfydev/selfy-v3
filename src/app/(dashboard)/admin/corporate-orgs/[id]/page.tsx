import { requireRole } from '@/lib/guards';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import OrgSeatsManager from './OrgSeatsManager';

interface ViewOrgPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ViewOrgPage({ params }: ViewOrgPageProps) {
  await requireRole('ADMIN', '/dashboard');

  const { id } = await params;

  const [org, allUsers] = await Promise.all([
    prisma.corporateOrg.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        admins: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        seats: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        packages: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            bookings: true,
          },
        },
      },
    }),
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: {
        email: 'asc',
      },
    }),
  ]);

  if (!org) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/admin/corporate-orgs" className="hover:text-primary">
            Corporate Organizations
          </Link>
          <span>/</span>
          <span>{org.name}</span>
        </div>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{org.name}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Organization details and member management.
            </p>
          </div>
          <Link href={`/admin/corporate-orgs/${org.id}/edit`}>
            <button className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-base font-medium text-white transition-all duration-200 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
              Edit Organization
            </button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-lg bg-card p-6 shadow">
          <h3 className="text-sm font-medium text-foreground0">Total Seats</h3>
          <p className="mt-2 text-3xl font-bold text-foreground">
            {org.seats.length} / {org.maxSeats}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {org.maxSeats - org.seats.length} available
          </p>
        </div>
        <div className="rounded-lg bg-card p-6 shadow">
          <h3 className="text-sm font-medium text-foreground0">Active Packages</h3>
          <p className="mt-2 text-3xl font-bold text-foreground">
            {org.packages.filter((p) => p.isActive).length}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{org.packages.length} total packages</p>
        </div>
        <div className="rounded-lg bg-card p-6 shadow">
          <h3 className="text-sm font-medium text-foreground0">Total Bookings</h3>
          <p className="mt-2 text-3xl font-bold text-foreground">{org._count.bookings}</p>
          <p className="mt-1 text-sm text-muted-foreground">All time</p>
        </div>
      </div>

      <div className="rounded-lg bg-card p-6 shadow">
        <h2 className="text-lg font-semibold text-foreground">Organization Details</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-foreground0">Owner</p>
            <p className="mt-1 text-base text-foreground">{org.owner.name || 'Unnamed User'}</p>
            <p className="text-sm text-muted-foreground">{org.owner.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground0">Organization Discount</p>
            <p className="mt-1 text-base text-foreground">{org.discountPercent}%</p>
          </div>
          {org.email && (
            <div>
              <p className="text-sm font-medium text-foreground0">Email</p>
              <p className="mt-1 text-base text-foreground">{org.email}</p>
            </div>
          )}
          {org.phone && (
            <div>
              <p className="text-sm font-medium text-foreground0">Phone</p>
              <p className="mt-1 text-base text-foreground">{org.phone}</p>
            </div>
          )}
          {org.address && (
            <div className="md:col-span-2">
              <p className="text-sm font-medium text-foreground0">Address</p>
              <p className="mt-1 text-base text-foreground">{org.address}</p>
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-foreground0">Status</p>
            <p className="mt-1">
              <span
                className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                  org.isActive ? 'bg-muted text-foreground' : 'bg-muted text-foreground'
                }`}
              >
                {org.isActive ? 'Active' : 'Inactive'}
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-card shadow">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">Corporate Packages</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border bg-background">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground">
                  Package Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground">
                  Credits
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground">
                  Discount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {org.packages.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-sm text-foreground0">
                    No packages found.{' '}
                    <Link
                      href="/admin/corporate-packages/new"
                      className="text-primary hover:text-primary"
                    >
                      Create one
                    </Link>
                  </td>
                </tr>
              ) : (
                org.packages.map((pkg) => (
                  <tr key={pkg.id} className="hover:bg-background">
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{pkg.name}</td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {pkg.usedCredits} / {pkg.totalCredits}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {pkg.permanentDiscountPercent}%
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          pkg.isActive
                            ? 'bg-muted text-foreground'
                            : 'bg-muted text-foreground'
                        }`}
                      >
                        {pkg.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <OrgSeatsManager
        orgId={org.id}
        seats={org.seats}
        maxSeats={org.maxSeats}
        availableUsers={allUsers}
      />
    </div>
  );
}
