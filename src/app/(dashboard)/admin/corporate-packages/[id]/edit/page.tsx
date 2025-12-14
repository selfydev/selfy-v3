import { requireRole } from '@/lib/guards';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import PackageForm from '../../PackageForm';
import Link from 'next/link';

export default async function EditPackagePage({ params }: { params: { id: string } }) {
  await requireRole('ADMIN', '/dashboard');

  const [corporatePackage, orgs] = await Promise.all([
    prisma.corporatePackage.findUnique({
      where: { id: params.id },
      include: {
        org: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
    prisma.corporateOrg.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    }),
  ]);

  if (!corporatePackage) {
    notFound();
  }

  const initialData = {
    orgId: corporatePackage.orgId,
    name: corporatePackage.name,
    description: corporatePackage.description || '',
    totalCredits: corporatePackage.totalCredits.toString(),
    permanentDiscountPercent: corporatePackage.permanentDiscountPercent.toString(),
    expiresAt: (corporatePackage.expiresAt
      ? new Date(corporatePackage.expiresAt).toISOString().split('T')[0]
      : '') as string,
    isActive: corporatePackage.isActive,
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-4 flex items-center gap-2 text-sm text-neutral-600">
          <Link href="/admin/corporate-packages" className="hover:text-primary-600">
            Corporate Packages
          </Link>
          <span>/</span>
          <span>Edit Package</span>
        </div>
        <h1 className="text-2xl font-bold text-neutral-900">Edit Corporate Package</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Update the details of {corporatePackage.name}.
        </p>
      </div>

      <div className="rounded-lg bg-white p-6 shadow">
        <PackageForm
          mode="edit"
          packageId={corporatePackage.id}
          initialData={initialData}
          orgs={orgs}
        />
      </div>
    </div>
  );
}
