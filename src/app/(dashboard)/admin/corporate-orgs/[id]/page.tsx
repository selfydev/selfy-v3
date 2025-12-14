import { requireRole } from '@/lib/guards';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function ViewOrgPage({ params }: { params: { id: string } }) {
  await requireRole('ADMIN', '/dashboard');

  const org = await prisma.corporateOrg.findUnique({
    where: { id: params.id },
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
  });

  if (!org) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-4 flex items-center gap-2 text-sm text-neutral-600">
          <Link href="/admin/corporate-orgs" className="hover:text-primary-600">
            Corporate Organizations
          </Link>
          <span>/</span>
          <span>{org.name}</span>
        </div>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">{org.name}</h1>
            <p className="mt-2 text-sm text-neutral-600">
              Organization details and member management.
            </p>
          </div>
          <Link href={`/admin/corporate-orgs/${org.id}/edit`}>
            <button className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-4 py-2 text-base font-medium text-white transition-all duration-200 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
              Edit Organization
            </button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-sm font-medium text-neutral-500">Total Seats</h3>
          <p className="mt-2 text-3xl font-bold text-neutral-900">
            {org.seats.length} / {org.maxSeats}
          </p>
          <p className="mt-1 text-sm text-neutral-600">
            {org.maxSeats - org.seats.length} available
          </p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-sm font-medium text-neutral-500">Active Packages</h3>
          <p className="mt-2 text-3xl font-bold text-neutral-900">
            {org.packages.filter((p) => p.isActive).length}
          </p>
          <p className="mt-1 text-sm text-neutral-600">{org.packages.length} total packages</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-sm font-medium text-neutral-500">Total Bookings</h3>
          <p className="mt-2 text-3xl font-bold text-neutral-900">{org._count.bookings}</p>
          <p className="mt-1 text-sm text-neutral-600">All time</p>
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="text-lg font-semibold text-neutral-900">Organization Details</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-neutral-500">Owner</p>
            <p className="mt-1 text-base text-neutral-900">{org.owner.name || 'Unnamed User'}</p>
            <p className="text-sm text-neutral-600">{org.owner.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-500">Organization Discount</p>
            <p className="mt-1 text-base text-neutral-900">{org.discountPercent}%</p>
          </div>
          {org.email && (
            <div>
              <p className="text-sm font-medium text-neutral-500">Email</p>
              <p className="mt-1 text-base text-neutral-900">{org.email}</p>
            </div>
          )}
          {org.phone && (
            <div>
              <p className="text-sm font-medium text-neutral-500">Phone</p>
              <p className="mt-1 text-base text-neutral-900">{org.phone}</p>
            </div>
          )}
          {org.address && (
            <div className="md:col-span-2">
              <p className="text-sm font-medium text-neutral-500">Address</p>
              <p className="mt-1 text-base text-neutral-900">{org.address}</p>
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-neutral-500">Status</p>
            <p className="mt-1">
              <span
                className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                  org.isActive ? 'bg-green-100 text-green-800' : 'bg-neutral-100 text-neutral-800'
                }`}
              >
                {org.isActive ? 'Active' : 'Inactive'}
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-white shadow">
        <div className="border-b border-neutral-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-neutral-900">Corporate Packages</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-neutral-200 bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-700">
                  Package Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-700">
                  Credits
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-700">
                  Discount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-700">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {org.packages.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-sm text-neutral-500">
                    No packages found.{' '}
                    <Link
                      href="/admin/corporate-packages/new"
                      className="text-primary-600 hover:text-primary-900"
                    >
                      Create one
                    </Link>
                  </td>
                </tr>
              ) : (
                org.packages.map((pkg) => (
                  <tr key={pkg.id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4 text-sm font-medium text-neutral-900">{pkg.name}</td>
                    <td className="px-6 py-4 text-sm text-neutral-900">
                      {pkg.usedCredits} / {pkg.totalCredits}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-900">
                      {pkg.permanentDiscountPercent}%
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          pkg.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-neutral-100 text-neutral-800'
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

      <div className="rounded-lg bg-white shadow">
        <div className="border-b border-neutral-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-neutral-900">Organization Seats</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-neutral-200 bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-700">
                  Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-700">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-700">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-700">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {org.seats.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-sm text-neutral-500">
                    No members found.
                  </td>
                </tr>
              ) : (
                org.seats.map((seat) => (
                  <tr key={seat.id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4 text-sm font-medium text-neutral-900">
                      {seat.user.name || 'Unnamed User'}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-900">{seat.user.email}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          seat.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-neutral-100 text-neutral-800'
                        }`}
                      >
                        {seat.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-900">
                      {new Date(seat.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
