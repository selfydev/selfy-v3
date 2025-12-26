'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/date-utils';

interface CorporatePackage {
  id: string;
  name: string;
  description: string | null;
  totalCredits: number;
  usedCredits: number;
  permanentDiscountPercent: number;
  expiresAt: Date | null;
  isActive: boolean;
  createdAt: Date;
  org: {
    id: string;
    name: string;
  };
  _count: {
    bookings: number;
  };
}

interface PackageListClientProps {
  initialPackages: CorporatePackage[];
}

export default function PackageListClient({ initialPackages }: PackageListClientProps) {
  const router = useRouter();
  const [packages, setPackages] = useState(initialPackages);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [packageToDelete, setPackageToDelete] = useState<CorporatePackage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const filteredPackages = packages.filter((pkg) => {
    if (filter === 'active') return pkg.isActive;
    if (filter === 'inactive') return !pkg.isActive;
    return true;
  });

  const handleDeleteClick = (pkg: CorporatePackage) => {
    setPackageToDelete(pkg);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!packageToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/corporate-packages/${packageToDelete.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Failed to delete package');
        return;
      }

      setPackages(packages.filter((p) => p.id !== packageToDelete.id));
      setDeleteModalOpen(false);
      setPackageToDelete(null);
      router.refresh();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete package');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleActive = async (pkg: CorporatePackage) => {
    try {
      const response = await fetch(`/api/admin/corporate-packages/${pkg.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: !pkg.isActive,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Failed to update package');
        return;
      }

      setPackages(packages.map((p) => (p.id === pkg.id ? { ...p, isActive: !p.isActive } : p)));
      router.refresh();
    } catch (error) {
      console.error('Toggle active error:', error);
      alert('Failed to update package');
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
            All ({packages.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === 'active'
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            Active ({packages.filter((p) => p.isActive).length})
          </button>
          <button
            onClick={() => setFilter('inactive')}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === 'inactive'
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            Inactive ({packages.filter((p) => !p.isActive).length})
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-y border-border bg-background">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground">
                Package
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground">
                Organization
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground">
                Credits
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground">
                Discount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground">
                Expires
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
            {filteredPackages.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-sm text-foreground0">
                  No packages found. Create your first corporate package to get started.
                </td>
              </tr>
            ) : (
              filteredPackages.map((pkg) => (
                <tr key={pkg.id} className="hover:bg-background">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <div className="font-medium text-foreground">{pkg.name}</div>
                      {pkg.description && (
                        <div className="mt-1 text-sm text-foreground0">
                          {pkg.description.length > 40
                            ? `${pkg.description.substring(0, 40)}...`
                            : pkg.description}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">{pkg.org.name}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-foreground">
                      {pkg.usedCredits} / {pkg.totalCredits}
                    </div>
                    <div className="text-xs text-foreground0">
                      {pkg.totalCredits - pkg.usedCredits} remaining
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    {pkg.permanentDiscountPercent}%
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    {pkg.expiresAt ? formatDate(pkg.expiresAt) : 'No expiry'}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleActive(pkg)}
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        pkg.isActive
                          ? 'bg-muted text-foreground'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      {pkg.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/corporate-packages/${pkg.id}/edit`}
                        className="text-primary hover:text-primary"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteClick(pkg)}
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
          <ModalTitle>Delete Package</ModalTitle>
        </ModalHeader>
        <ModalBody>
          {packageToDelete && (
            <div>
              <p className="text-foreground">
                Are you sure you want to delete <strong>{packageToDelete.name}</strong>?
              </p>
              {packageToDelete._count.bookings > 0 && (
                <div className="mt-4 rounded-lg bg-error-DEFAULT/10 p-4">
                  <p className="text-sm text-destructive">
                    This package has {packageToDelete._count.bookings} existing booking(s). It
                    cannot be deleted. Consider deactivating it instead.
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
            
            disabled={isDeleting || !!(packageToDelete && packageToDelete._count.bookings > 0)}
          >
            Delete
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
