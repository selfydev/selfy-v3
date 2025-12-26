import { requireRole } from '@/lib/guards';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import OrgListClient from './OrgListClient';

export default async function AdminCorporateOrgsPage() {
  await requireRole('ADMIN', '/dashboard');

  const orgs = await prisma.corporateOrg.findMany({
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      _count: {
        select: {
          admins: true,
          seats: true,
          packages: true,
          bookings: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Corporate Organizations</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage corporate organizations and their settings.
          </p>
        </div>
        <Link href="/admin/corporate-orgs/new">
          <button className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-base font-medium text-white transition-all duration-200 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
            <svg
              className="mr-2 h-5 w-5"
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
            Create Organization
          </button>
        </Link>
      </div>

      <div className="rounded-lg bg-card shadow">
        <OrgListClient initialOrgs={orgs} />
      </div>
    </div>
  );
}
