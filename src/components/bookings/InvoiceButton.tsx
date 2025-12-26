'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/toast';

interface InvoiceButtonProps {
  bookingId: string;
  isCorporate: boolean;
  invoiceNumber?: string | null;
  currentStatus: string;
  userRole?: string;
}
export function InvoiceButton({
  bookingId,
  isCorporate,
  invoiceNumber,
  currentStatus,
  userRole: _userRole,
}: InvoiceButtonProps) {
  const router = useRouter();
  const { success: showSuccess, error: showError } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateInvoice = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/bookings/${bookingId}/invoice`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create invoice');
      }

      const data = await response.json();
      showSuccess(`Invoice ${data.invoiceNumber} created successfully!`, 5000);
      router.refresh();
    } catch (error) {
      console.error('Invoice creation error:', error);
      showError(error instanceof Error ? error.message : 'Failed to create invoice', 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadInvoice = () => {
    window.open(`/api/bookings/${bookingId}/invoice/download`, '_blank');
  };

  // Only show for corporate bookings
  if (!isCorporate) {
    return null;
  }

  // If invoice already exists, show download button
  if (invoiceNumber) {
    return (
      <button
        onClick={handleDownloadInvoice}
        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium transition-colors flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Download Invoice {invoiceNumber}
      </button>
    );
  }

  // Show create invoice button for corporate bookings that aren't invoiced yet
  if (currentStatus !== 'INVOICED') {
    return (
      <button
        onClick={handleCreateInvoice}
        disabled={isLoading}
        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Creating...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Create Invoice
          </>
        )}
      </button>
    );
  }

  return null;
}
