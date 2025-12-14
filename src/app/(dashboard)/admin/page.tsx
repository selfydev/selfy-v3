import { requireRole } from '@/lib/guards';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function AdminPage() {
  const user = await requireRole('ADMIN', '/dashboard');

  const [productsCount, orgsCount, packagesCount] = await Promise.all([
    prisma.product.count(),
    prisma.corporateOrg.count(),
    prisma.corporatePackage.count(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Admin Dashboard</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Manage products, organizations, and corporate packages.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-sm font-medium text-neutral-500">Products</h3>
          <p className="mt-2 text-3xl font-bold text-neutral-900">{productsCount}</p>
          <Link
            href="/admin/products"
            className="mt-4 inline-flex text-sm font-medium text-primary-600 hover:text-primary-900"
          >
            Manage Products →
          </Link>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-sm font-medium text-neutral-500">Organizations</h3>
          <p className="mt-2 text-3xl font-bold text-neutral-900">{orgsCount}</p>
          <Link
            href="/admin/corporate-orgs"
            className="mt-4 inline-flex text-sm font-medium text-primary-600 hover:text-primary-900"
          >
            Manage Organizations →
          </Link>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-sm font-medium text-neutral-500">Corporate Packages</h3>
          <p className="mt-2 text-3xl font-bold text-neutral-900">{packagesCount}</p>
          <Link
            href="/admin/corporate-packages"
            className="mt-4 inline-flex text-sm font-medium text-primary-600 hover:text-primary-900"
          >
            Manage Packages →
          </Link>
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="text-lg font-semibold text-neutral-900">Quick Actions</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/admin/products/new"
            className="flex items-center gap-3 rounded-lg border-2 border-neutral-200 p-4 transition-colors hover:border-primary-600 hover:bg-primary-50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-neutral-900">Create Product</h3>
              <p className="text-sm text-neutral-600">Add new service</p>
            </div>
          </Link>

          <Link
            href="/admin/corporate-orgs/new"
            className="flex items-center gap-3 rounded-lg border-2 border-neutral-200 p-4 transition-colors hover:border-primary-600 hover:bg-primary-50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-neutral-900">Create Organization</h3>
              <p className="text-sm text-neutral-600">Add corporate client</p>
            </div>
          </Link>

          <Link
            href="/admin/corporate-packages/new"
            className="flex items-center gap-3 rounded-lg border-2 border-neutral-200 p-4 transition-colors hover:border-primary-600 hover:bg-primary-50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-neutral-900">Create Package</h3>
              <p className="text-sm text-neutral-600">Add credit bundle</p>
            </div>
          </Link>
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="text-lg font-semibold text-neutral-900">Admin Information</h2>
        <div className="mt-4 space-y-2">
          <p className="text-sm text-neutral-600">
            <span className="font-medium">Email:</span> {user.email}
          </p>
          <p className="text-sm text-neutral-600">
            <span className="font-medium">Role:</span> {user.role}
          </p>
          <p className="text-sm text-neutral-600">
            <span className="font-medium">User ID:</span> {user.id}
          </p>
        </div>
      </div>
    </div>
  );
}
