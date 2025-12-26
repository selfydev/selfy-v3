'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/toast';
import { Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/date-utils';

interface Seat {
  id: string;
  userId: string;
  isActive: boolean;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

interface User {
  id: string;
  name: string | null;
  email: string;
}

interface OrgSeatsManagerProps {
  orgId: string;
  seats: Seat[];
  maxSeats: number;
  availableUsers: User[];
}

export default function OrgSeatsManager({
  orgId,
  seats: initialSeats,
  maxSeats,
  availableUsers,
}: OrgSeatsManagerProps) {
  const router = useRouter();
  const { success: showSuccess, error: showError } = useToast();
  const [seats, setSeats] = useState(initialSeats);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);

  // Filter out users who already have seats
  const availableUsersToAdd = availableUsers.filter(
    (user) => !seats.some((seat) => seat.userId === user.id)
  );

  const handleAddSeat = async () => {
    if (!selectedUserId) {
      showError('Please select a user', 3000);
      return;
    }

    setIsAdding(true);
    try {
      const response = await fetch(`/api/admin/corporate-orgs/${orgId}/seats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: selectedUserId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add user');
      }

      const data = await response.json();
      showSuccess('User added to organization successfully!', 3000);
      setAddModalOpen(false);
      setSelectedUserId('');
      router.refresh();
      
      // Update local state
      setSeats([...seats, data.seat]);
    } catch (error) {
      console.error('Add seat error:', error);
      showError(error instanceof Error ? error.message : 'Failed to add user', 5000);
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveSeat = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this user from the organization?')) {
      return;
    }

    setIsRemoving(userId);
    try {
      const response = await fetch(`/api/admin/corporate-orgs/${orgId}/seats?userId=${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to remove user');
      }

      showSuccess('User removed from organization successfully!', 3000);
      router.refresh();
      
      // Update local state
      setSeats(seats.filter((seat) => seat.userId !== userId));
    } catch (error) {
      console.error('Remove seat error:', error);
      showError(error instanceof Error ? error.message : 'Failed to remove user', 5000);
    } finally {
      setIsRemoving(null);
    }
  };

  const canAddMore = seats.length < maxSeats;

  return (
    <>
      <div className="rounded-lg bg-card shadow">
        <div className="border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Organization Seats</h2>
          {canAddMore && (
            <Button
              variant="default"
              size="sm"
              onClick={() => setAddModalOpen(true)}
            >
              Add Member
            </Button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border bg-background">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground">
                  Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground">
                  Joined
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {seats.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-foreground0">
                    No members found.{' '}
                    {canAddMore && (
                      <button
                        onClick={() => setAddModalOpen(true)}
                        className="text-primary hover:text-primary font-medium"
                      >
                        Add one
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                seats.map((seat) => (
                  <tr key={seat.id} className="hover:bg-background">
                    <td className="px-6 py-4 text-sm font-medium text-foreground">
                      {seat.user.name || 'Unnamed User'}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">{seat.user.email}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          seat.isActive
                            ? 'bg-muted text-foreground'
                            : 'bg-muted text-foreground'
                        }`}
                      >
                        {seat.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {formatDate(seat.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <button
                        onClick={() => handleRemoveSeat(seat.userId)}
                        disabled={isRemoving === seat.userId}
                        className="text-destructive hover:text-destructive disabled:opacity-50 inline-flex items-center gap-1"
                      >
                        {isRemoving === seat.userId && (
                          <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                        )}
                        {isRemoving === seat.userId ? 'Removing...' : 'Remove'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Member Modal */}
      <Modal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)}>
        <ModalHeader>
          <ModalTitle>Add Member to Organization</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Select a user to add to this organization. They will be able to access corporate pricing and packages.
            </p>
            <div>
              <label htmlFor="userId" className="block text-sm font-medium text-foreground">
                User
              </label>
              <select
                id="userId"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="mt-1 block w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Select a user...</option>
                {availableUsersToAdd.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name || 'Unnamed User'} ({user.email})
                  </option>
                ))}
              </select>
              {availableUsersToAdd.length === 0 && (
                <p className="mt-2 text-sm text-foreground0">
                  All available users are already members of this organization.
                </p>
              )}
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="outline"
            onClick={() => {
              setAddModalOpen(false);
              setSelectedUserId('');
            }}
            disabled={isAdding}
          >
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={handleAddSeat}
            disabled={isAdding || !selectedUserId}
            isLoading={isAdding}
          >
            Add Member
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
