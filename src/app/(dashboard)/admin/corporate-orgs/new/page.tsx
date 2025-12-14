import { requireRole } from '@/lib/guards';
import { prisma } from '@/lib/prisma';
import OrgForm from '../OrgForm';
import Link from 'next/link';

export default async function NewOrgPage() {
  await requireRole('ADMIN', '/dashboard');

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
    },
    orderBy: {
      email: 'asc',
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-4 flex items-center gap-2 text-sm text-neutral-600">
          <Link href="/admin/corporate-orgs" className="hover:text-primary-600">
            Corporate Organizations
          </Link>
          <span>/</span>
          <span>New Organization</span>
        </div>
        <h1 className="text-2xl font-bold text-neutral-900">Create Corporate Organization</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Create a new corporate organization with custom settings and discounts.
        </p>
      </div>

      <div className="rounded-lg bg-white p-6 shadow">
        <OrgForm mode="create" users={users} />
      </div>
    </div>
  );
}
