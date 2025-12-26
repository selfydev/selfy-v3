import { requireRole } from '@/lib/guards';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import OrgForm from '../../OrgForm';
import Link from 'next/link';

interface EditOrgPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditOrgPage({ params }: EditOrgPageProps) {
  await requireRole('ADMIN', '/dashboard');

  const { id } = await params;

  const [org, users] = await Promise.all([
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
        <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/admin/corporate-orgs" className="hover:text-primary">
            Corporate Organizations
          </Link>
          <span>/</span>
          <span>Edit Organization</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground">Edit Corporate Organization</h1>
        <p className="mt-2 text-sm text-muted-foreground">Update the details of {org.name}.</p>
      </div>

      <div className="rounded-lg bg-card p-6 shadow">
        <OrgForm mode="edit" orgId={org.id} initialData={initialData} users={users} />
      </div>
    </div>
  );
}
