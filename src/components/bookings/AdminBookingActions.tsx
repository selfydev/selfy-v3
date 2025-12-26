'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/toast';
import { Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AdminBookingActionsProps {
  bookingId: string;
  bookingNumber: string;
  status: string;
  quoteRequested: boolean;
  isCorporate: boolean;
  finalPrice: number;
}

type StatusAction = 'approve' | 'reject' | 'confirm' | 'complete' | 'cancel' | 'no_show';

export function AdminBookingActions({
  bookingId,
  bookingNumber,
  status,
  quoteRequested,
  isCorporate,
  finalPrice,
}: AdminBookingActionsProps) {
  const router = useRouter();
  const { success: showSuccess, error: showError } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<StatusAction | null>(null);
  const [netTerms, setNetTerms] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const openModal = (action: StatusAction) => {
    setCurrentAction(action);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setCurrentAction(null);
    setNetTerms('');
  };

  const handleAction = async () => {
    if (!currentAction) return;
    
    setIsProcessing(true);
    try {
      let endpoint = '';
      let successMessage = '';

      switch (currentAction) {
        case 'approve':
          endpoint = quoteRequested
            ? `/api/admin/bookings/${bookingId}/approve-quote`
            : `/api/admin/bookings/${bookingId}/approve`;
          successMessage = quoteRequested ? 'Quote approved successfully!' : 'Booking approved successfully!';
          break;
        case 'confirm':
          endpoint = `/api/admin/bookings/${bookingId}/approve`;
          successMessage = 'Booking confirmed successfully!';
          break;
        case 'reject':
        case 'cancel':
          endpoint = `/api/admin/bookings/${bookingId}/reject`;
          successMessage = 'Booking cancelled';
          break;
        case 'complete':
          endpoint = `/api/admin/bookings/${bookingId}/complete`;
          successMessage = 'Booking marked as completed!';
          break;
        case 'no_show':
          endpoint = `/api/admin/bookings/${bookingId}/no-show`;
          successMessage = 'Booking marked as no-show';
          break;
      }

      const body = quoteRequested && currentAction === 'approve' 
        ? { netTerms: netTerms ? parseInt(netTerms) : undefined } 
        : {};

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Action failed');
      }

      showSuccess(successMessage, 3000);
      closeModal();
      router.refresh();
    } catch (error) {
      console.error('Action error:', error);
      showError(error instanceof Error ? error.message : 'Action failed', 5000);
    } finally {
      setIsProcessing(false);
    }
  };

  // Debug info for development
  const debugInfo = process.env.NODE_ENV === 'development' ? (
    <div className="mb-2 p-2 bg-gray-100 rounded text-xs font-mono">
      <div>Status: <span className="font-bold">{status}</span></div>
      <div>Quote Requested: <span className="font-bold">{quoteRequested ? 'true' : 'false'}</span></div>
      <div>Corporate: <span className="font-bold">{isCorporate ? 'true' : 'false'}</span></div>
    </div>
  ) : null;

  // Render based on current status
  const renderContent = () => {
    switch (status) {
      case 'DRAFT':
        return (
          <div className="rounded-lg bg-gray-50 border-2 border-gray-300 p-6 shadow">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Draft Booking
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              This booking is in draft status. It can be confirmed or cancelled.
            </p>
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => openModal('confirm')}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium transition-colors"
              >
                Confirm Booking
              </button>
              <button
                onClick={() => openModal('cancel')}
                className="flex-1 px-4 py-2 border-2 border-destructive/30 text-destructive rounded-lg hover:bg-destructive/10 font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        );

      case 'PENDING':
        return (
          <div className="rounded-lg bg-muted border-2 border-border p-6 shadow">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {quoteRequested ? 'Quote Request' : 'Pending Approval'}
            </h2>
            <p className="mt-2 text-sm text-foreground">
              {quoteRequested
                ? 'This corporate customer has requested a quote with net payment terms.'
                : 'This booking is awaiting admin approval.'}
            </p>
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => openModal('approve')}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium transition-colors"
              >
                {quoteRequested ? 'Approve Quote' : 'Approve Booking'}
              </button>
              <button
                onClick={() => openModal('reject')}
                className="flex-1 px-4 py-2 border-2 border-destructive/30 text-destructive rounded-lg hover:bg-destructive/10 font-medium transition-colors"
              >
                Reject
              </button>
            </div>
          </div>
        );

      case 'CONFIRMED':
        return (
          <div className="rounded-lg bg-blue-50 border-2 border-blue-300 p-6 shadow">
            <h2 className="text-lg font-semibold text-blue-900 flex items-center gap-2">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Confirmed Booking
            </h2>
            <p className="mt-2 text-sm text-blue-800">
              This booking is confirmed and scheduled.
            </p>
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => openModal('complete')}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium transition-colors"
              >
                Mark Completed
              </button>
              <button
                onClick={() => openModal('no_show')}
                className="flex-1 px-4 py-2 border-2 border-orange-300 text-orange-600 rounded-lg hover:bg-orange-50 font-medium transition-colors"
              >
                No-Show
              </button>
              <button
                onClick={() => openModal('cancel')}
                className="px-4 py-2 border-2 border-destructive/30 text-destructive rounded-lg hover:bg-destructive/10 font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        );

      case 'IN_PROGRESS':
        return (
          <div className="rounded-lg bg-purple-50 border-2 border-purple-300 p-6 shadow">
            <h2 className="text-lg font-semibold text-purple-900 flex items-center gap-2">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              In Progress
            </h2>
            <p className="mt-2 text-sm text-purple-800">
              This booking is currently in progress.
            </p>
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => openModal('complete')}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium transition-colors"
              >
                Mark Completed
              </button>
            </div>
          </div>
        );

      case 'COMPLETED':
        return (
          <div className="rounded-lg bg-muted border-2 border-green-300 p-6 shadow">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Completed
            </h2>
            <p className="mt-2 text-sm text-foreground">
              This booking has been completed successfully.
            </p>
          </div>
        );

      case 'CANCELLED':
        return (
          <div className="rounded-lg bg-red-50 border-2 border-destructive/30 p-6 shadow">
            <h2 className="text-lg font-semibold text-red-900 flex items-center gap-2">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancelled
            </h2>
            <p className="mt-2 text-sm text-red-800">
              This booking has been cancelled.
            </p>
          </div>
        );

      case 'NO_SHOW':
        return (
          <div className="rounded-lg bg-orange-50 border-2 border-orange-300 p-6 shadow">
            <h2 className="text-lg font-semibold text-orange-900 flex items-center gap-2">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              No-Show
            </h2>
            <p className="mt-2 text-sm text-orange-800">
              Customer did not show up for this booking.
            </p>
          </div>
        );

      case 'INVOICED':
        return (
          <div className="rounded-lg bg-indigo-50 border-2 border-indigo-300 p-6 shadow">
            <h2 className="text-lg font-semibold text-indigo-900 flex items-center gap-2">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Invoiced
            </h2>
            <p className="mt-2 text-sm text-indigo-800">
              Invoice has been generated for this booking.
            </p>
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => openModal('complete')}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium transition-colors"
              >
                Mark Completed
              </button>
            </div>
          </div>
        );

      default:
        return (
          <div className="rounded-lg bg-background border-2 border-border p-6 shadow">
            <h2 className="text-lg font-semibold text-foreground">
              Status: {status.replace('_', ' ')}
            </h2>
          </div>
        );
    }
  };

  const getModalContent = () => {
    switch (currentAction) {
      case 'approve':
        return {
          title: quoteRequested ? 'Approve Quote' : 'Approve Booking',
          description: `Confirm approval for booking ${bookingNumber}?`,
          buttonText: quoteRequested ? 'Approve Quote' : 'Approve Booking',
          buttonClass: 'bg-primary hover:bg-primary/90',
          showNetTerms: quoteRequested,
        };
      case 'confirm':
        return {
          title: 'Confirm Booking',
          description: `Confirm booking ${bookingNumber}? This will change the status to CONFIRMED.`,
          buttonText: 'Confirm Booking',
          buttonClass: 'bg-primary hover:bg-primary/90',
          showNetTerms: false,
        };
      case 'reject':
        return {
          title: 'Reject Booking',
          description: `Are you sure you want to reject booking ${bookingNumber}?`,
          warning: 'This action will cancel the booking. If the customer has made any payments, they may need to be refunded manually.',
          buttonText: 'Reject Booking',
          buttonClass: 'bg-destructive hover:bg-destructive/90',
          showNetTerms: false,
        };
      case 'cancel':
        return {
          title: 'Cancel Booking',
          description: `Are you sure you want to cancel booking ${bookingNumber}?`,
          warning: 'This action will cancel the booking. If the customer has made any payments, they may need to be refunded manually.',
          buttonText: 'Cancel Booking',
          buttonClass: 'bg-destructive hover:bg-destructive/90',
          showNetTerms: false,
        };
      case 'complete':
        return {
          title: 'Mark as Completed',
          description: `Mark booking ${bookingNumber} as completed?`,
          buttonText: 'Mark Completed',
          buttonClass: 'bg-primary hover:bg-primary/90',
          showNetTerms: false,
        };
      case 'no_show':
        return {
          title: 'Mark as No-Show',
          description: `Mark booking ${bookingNumber} as no-show?`,
          warning: 'This indicates the customer did not show up for their scheduled appointment.',
          buttonText: 'Mark No-Show',
          buttonClass: 'bg-orange-600 hover:bg-orange-700',
          showNetTerms: false,
        };
      default:
        return {
          title: 'Action',
          description: '',
          buttonText: 'Confirm',
          buttonClass: '',
          showNetTerms: false,
        };
    }
  };

  const modalContent = getModalContent();

  return (
    <>
      {debugInfo}
      {renderContent()}

      {/* Action Modal */}
      <Modal isOpen={modalOpen} onClose={closeModal}>
        <ModalHeader>
          <ModalTitle>{modalContent.title}</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{modalContent.description}</p>
            
            <div className="rounded-lg bg-background p-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-semibold">${finalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-muted-foreground">Type:</span>
                <span className="font-medium">{isCorporate ? 'Corporate' : 'Regular'}</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-muted-foreground">Current Status:</span>
                <span className="font-medium">{status.replace('_', ' ')}</span>
              </div>
            </div>
            
            {modalContent.showNetTerms && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Net Terms (days)</label>
                <Input
                  type="number"
                  min="0"
                  value={netTerms}
                  onChange={(e) => setNetTerms(e.target.value)}
                  placeholder="e.g., 30, 60, 90 (optional)"
                />
                <p className="text-sm text-muted-foreground">Payment terms in days. Leave empty for immediate payment.</p>
              </div>
            )}

            {modalContent.warning && (
              <div className="rounded-lg bg-red-50 p-4 border border-red-200">
                <p className="text-sm text-red-700">
                  <strong>Warning:</strong> {modalContent.warning}
                </p>
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={closeModal} disabled={isProcessing}>
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={handleAction}
            disabled={isProcessing}
            isLoading={isProcessing}
            className={modalContent.buttonClass}
          >
            {modalContent.buttonText}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
