import { requireRole } from '@/lib/guards';
import { prisma } from '@/lib/prisma';
import PackageForm from '../PackageForm';
import Link from 'next/link';

export default async function NewPackagePage() {
  await requireRole('ADMIN', '/dashboard');

  const orgs = await prisma.corporateOrg.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: 'asc',
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-4 flex items-center gap-2 text-sm text-neutral-600">
          <Link href="/admin/corporate-packages" className="hover:text-primary-600">
            Corporate Packages
          </Link>
          <span>/</span>
          <span>New Package</span>
        </div>
        <h1 className="text-2xl font-bold text-neutral-900">Create Corporate Package</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Create a new corporate package with credits and discounts.
        </p>
      </div>

      {orgs.length === 0 ? (
        <div className="rounded-lg bg-yellow-50 p-6">
          <h3 className="text-base font-semibold text-yellow-900">No Organizations Found</h3>
          <p className="mt-2 text-sm text-yellow-700">
            You need to create at least one corporate organization before creating packages.
          </p>
          <Link
            href="/admin/corporate-orgs/new"
            className="mt-4 inline-flex items-center text-sm font-medium text-yellow-900 hover:text-yellow-800"
          >
            Create Organization →
          </Link>
        </div>
      ) : (
        <div className="rounded-lg bg-white p-6 shadow">
          <PackageForm mode="create" orgs={orgs} />
        </div>
      )}
    </div>
  );
}
