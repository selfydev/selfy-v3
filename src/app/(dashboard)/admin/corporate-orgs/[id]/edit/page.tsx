import { requireRole } from '@/lib/guards';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import OrgForm from '../../OrgForm';
import Link from 'next/link';

export default async function EditOrgPage({ params }: { params: { id: string } }) {
  await requireRole('ADMIN', '/dashboard');

  const [org, users] = await Promise.all([
    prisma.corporateOrg.findUnique({
      where: { id: params.id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
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

  const initialData = {
    name: org.name,
    email: org.email || '',
    phone: org.phone || '',
    address: org.address || '',
    maxSeats: org.maxSeats.toString(),
    discountPercent: org.discountPercent.toString(),
    ownerId: org.ownerId,
    isActive: org.isActive,
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-4 flex items-center gap-2 text-sm text-neutral-600">
          <Link href="/admin/corporate-orgs" className="hover:text-primary-600">
            Corporate Organizations
          </Link>
          <span>/</span>
          <span>Edit Organization</span>
        </div>
        <h1 className="text-2xl font-bold text-neutral-900">Edit Corporate Organization</h1>
        <p className="mt-2 text-sm text-neutral-600">Update the details of {org.name}.</p>
      </div>

      <div className="rounded-lg bg-white p-6 shadow">
        <OrgForm mode="edit" orgId={org.id} initialData={initialData} users={users} />
      </div>
    </div>
  );
}
