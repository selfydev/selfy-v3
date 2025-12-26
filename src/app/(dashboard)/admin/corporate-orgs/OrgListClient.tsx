'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';

interface CorporateOrg {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  maxSeats: number;
  discountPercent: number;
  isActive: boolean;
  createdAt: Date;
  owner: {
    id: string;
    name: string | null;
    email: string;
  };
  _count: {
    admins: number;
    seats: number;
    packages: number;
    bookings: number;
  };
}

interface OrgListClientProps {
  initialOrgs: CorporateOrg[];
}

export default function OrgListClient({ initialOrgs }: OrgListClientProps) {
  const router = useRouter();
  const [orgs, setOrgs] = useState(initialOrgs);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [orgToDelete, setOrgToDelete] = useState<CorporateOrg | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const filteredOrgs = orgs.filter((org) => {
    if (filter === 'active') return org.isActive;
    if (filter === 'inactive') return !org.isActive;
    return true;
  });

  const handleDeleteClick = (org: CorporateOrg) => {
    setOrgToDelete(org);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!orgToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/corporate-orgs/${orgToDelete.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Failed to delete organization');
        return;
      }

      setOrgs(orgs.filter((o) => o.id !== orgToDelete.id));
      setDeleteModalOpen(false);
      setOrgToDelete(null);
      router.refresh();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete organization');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleActive = async (org: CorporateOrg) => {
    try {
      const response = await fetch(`/api/admin/corporate-orgs/${org.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: !org.isActive,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Failed to update organization');
        return;
      }

      setOrgs(orgs.map((o) => (o.id === org.id ? { ...o, isActive: !o.isActive } : o)));
      router.refresh();
    } catch (error) {
      console.error('Toggle active error:', error);
      alert('Failed to update organization');
    }
  };

  return (
    <>
      <div className="px-6 py-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            All ({orgs.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === 'active'
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            Active ({orgs.filter((o) => o.isActive).length})
          </button>
          <button
            onClick={() => setFilter('inactive')}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === 'inactive'
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            Inactive ({orgs.filter((o) => !o.isActive).length})
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-y border-border bg-background">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground">
                Organization
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground">
                Owner
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground">
                Seats
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground">
                Discount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground">
                Packages
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-card">
            {filteredOrgs.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-sm text-foreground0">
                  No organizations found. Create your first organization to get started.
                </td>
              </tr>
            ) : (
              filteredOrgs.map((org) => (
                <tr key={org.id} className="hover:bg-background">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <div className="font-medium text-foreground">{org.name}</div>
                      {org.email && (
                        <div className="mt-1 text-sm text-foreground0">{org.email}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-foreground">
                      {org.owner.name || 'Unnamed User'}
                    </div>
                    <div className="text-xs text-foreground0">{org.owner.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-foreground">
                      {org._count.seats} / {org.maxSeats}
                    </div>
                    <div className="text-xs text-foreground0">
                      {org.maxSeats - org._count.seats} available
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">{org.discountPercent}%</td>
                  <td className="px-6 py-4 text-sm text-foreground">{org._count.packages}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleActive(org)}
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        org.isActive
                          ? 'bg-muted text-foreground'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      {org.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/corporate-orgs/${org.id}`}
                        className="text-primary hover:text-primary"
                      >
                        View
                      </Link>
                      <Link
                        href={`/admin/corporate-orgs/${org.id}/edit`}
                        className="text-primary hover:text-primary"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteClick(org)}
                        className="text-destructive hover:text-destructive"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
        <ModalHeader>
          <ModalTitle>Delete Organization</ModalTitle>
        </ModalHeader>
        <ModalBody>
          {orgToDelete && (
            <div>
              <p className="text-foreground">
                Are you sure you want to delete <strong>{orgToDelete.name}</strong>?
              </p>
              {(orgToDelete._count.bookings > 0 || orgToDelete._count.packages > 0) && (
                <div className="mt-4 rounded-lg bg-error-DEFAULT/10 p-4">
                  <p className="text-sm text-destructive">
                    This organization has {orgToDelete._count.bookings} booking(s) and{' '}
                    {orgToDelete._count.packages} package(s). It cannot be deleted. Consider
                    deactivating it instead.
                  </p>
                </div>
              )}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setDeleteModalOpen(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteConfirm}
            
            disabled={
              isDeleting ||
              !!(
                orgToDelete &&
                (orgToDelete._count.bookings > 0 || orgToDelete._count.packages > 0)
              )
            }
          >
            Delete
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
