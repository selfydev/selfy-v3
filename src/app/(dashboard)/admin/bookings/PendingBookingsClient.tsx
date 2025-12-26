'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/components/ui/toast';
import { Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/date-utils';

interface PendingBooking {
  id: string;
  bookingNumber: string;
  finalPrice: number;
  scheduledAt: Date;
  notes: string | null;
  isCorporate: boolean;
  product: {
    name: string;
    price: number;
    duration: number;
  };
  customer: {
    id: string;
    name: string | null;
    email: string;
    role: string;
  };
  org: {
    id: string;
    name: string;
  } | null;
  payments: Array<{
    id: string;
    amount: number;
    status: string;
  }>;
}

interface PendingBookingsClientProps {
  initialBookings: PendingBooking[];
}

export default function PendingBookingsClient({ initialBookings }: PendingBookingsClientProps) {
  const router = useRouter();
  const { success: showSuccess, error: showError } = useToast();
  const [bookings, setBookings] = useState(initialBookings);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<PendingBooking | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApproveClick = (booking: PendingBooking) => {
    setSelectedBooking(booking);
    setApproveModalOpen(true);
  };

  const handleRejectClick = (booking: PendingBooking) => {
    setSelectedBooking(booking);
    setRejectModalOpen(true);
  };

  const handleApproveConfirm = async () => {
    if (!selectedBooking) return;

    setIsProcessing(true);
    try {
      const response = await fetch(`/api/admin/bookings/${selectedBooking.id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to approve booking');
      }

      showSuccess('Booking approved successfully!', 3000);
      setApproveModalOpen(false);
      setSelectedBooking(null);
      router.refresh();
      
      // Remove the approved booking from the list
      setBookings(bookings.filter((b) => b.id !== selectedBooking.id));
    } catch (error) {
      console.error('Approve booking error:', error);
      showError(error instanceof Error ? error.message : 'Failed to approve booking', 5000);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectConfirm = async () => {
    if (!selectedBooking) return;

    setIsProcessing(true);
    try {
      const response = await fetch(`/api/admin/bookings/${selectedBooking.id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to reject booking');
      }

      showSuccess('Booking rejected', 3000);
      setRejectModalOpen(false);
      setSelectedBooking(null);
      router.refresh();
      
      // Remove the rejected booking from the list
      setBookings(bookings.filter((b) => b.id !== selectedBooking.id));
    } catch (error) {
      console.error('Reject booking error:', error);
      showError(error instanceof Error ? error.message : 'Failed to reject booking', 5000);
    } finally {
      setIsProcessing(false);
    }
  };

  if (bookings.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-border p-12 text-center">
        <div className="text-4xl mb-4">✅</div>
        <p className="text-lg font-medium text-foreground">All caught up!</p>
        <p className="text-sm text-muted-foreground mt-1">No pending bookings at the moment.</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg bg-card shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-background">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground0">
                  Booking #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground0">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground0">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground0">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground0">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground0">
                  Scheduled
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-foreground0">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {bookings.map((booking) => {
                const hasPaidDeposit = booking.payments.length > 0;
                const totalPaid = booking.payments.reduce((sum, p) => sum + p.amount, 0);
                const isPaidInFull = totalPaid >= booking.finalPrice;
                
                return (
                  <tr key={booking.id} className="hover:bg-background">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-foreground">
                      <Link
                        href={`/bookings/${booking.id}`}
                        className="text-primary hover:text-primary"
                      >
                        {booking.bookingNumber}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-foreground">
                      <div>
                        <div className="font-medium">{booking.customer.name || 'N/A'}</div>
                        <div className="text-foreground0">{booking.customer.email}</div>
                        {booking.isCorporate && booking.org && (
                          <div className="text-xs text-primary">{booking.org.name}</div>
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-foreground">
                      <div>
                        <div className="font-medium">{booking.product.name}</div>
                        <div className="text-foreground0">{booking.product.duration} min</div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-foreground">
                      ${booking.finalPrice.toFixed(2)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      {isPaidInFull ? (
                        <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground">
                          ✓ Paid in Full
                        </span>
                      ) : hasPaidDeposit ? (
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                          Deposit: ${totalPaid.toFixed(2)}
                        </span>
                      ) : booking.isCorporate ? (
                        <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground">
                          Invoice Pending
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                          Awaiting Payment
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-foreground">
                      {formatDate(booking.scheduledAt)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleApproveClick(booking)}
                          className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary/90"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectClick(booking)}
                          className="rounded-md border border-destructive/30 px-3 py-1.5 text-sm font-medium text-destructive hover:bg-destructive/10"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approve Booking Modal */}
      <Modal isOpen={approveModalOpen} onClose={() => setApproveModalOpen(false)}>
        <ModalHeader>
          <ModalTitle>Approve Booking</ModalTitle>
        </ModalHeader>
        <ModalBody>
          {selectedBooking && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Confirm approval for booking <span className="font-medium">{selectedBooking.bookingNumber}</span>?
              </p>
              <div className="rounded-lg bg-background p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Customer:</span>
                    <span className="font-medium">{selectedBooking.customer.name || selectedBooking.customer.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Product:</span>
                    <span className="font-medium">{selectedBooking.product.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-semibold">${selectedBooking.finalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Scheduled:</span>
                    <span className="font-medium">{formatDate(selectedBooking.scheduledAt)}</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-foreground0">
                The customer will be notified that their booking has been confirmed.
              </p>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            variant="outline"
            onClick={() => setApproveModalOpen(false)}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={handleApproveConfirm}
            disabled={isProcessing}
            
          >
            Approve Booking
          </Button>
        </ModalFooter>
      </Modal>

      {/* Reject Booking Modal */}
      <Modal isOpen={rejectModalOpen} onClose={() => setRejectModalOpen(false)}>
        <ModalHeader>
          <ModalTitle>Reject Booking</ModalTitle>
        </ModalHeader>
        <ModalBody>
          {selectedBooking && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to reject booking <span className="font-medium">{selectedBooking.bookingNumber}</span>?
              </p>
              <div className="rounded-lg bg-red-50 p-4 border border-red-200">
                <p className="text-sm text-red-700">
                  <strong>Warning:</strong> This action will cancel the booking. If the customer has made any payments, they may need to be refunded manually.
                </p>
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            variant="outline"
            onClick={() => setRejectModalOpen(false)}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={handleRejectConfirm}
            disabled={isProcessing}
            
            className="bg-destructive hover:bg-destructive/90"
          >
            Reject Booking
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}

