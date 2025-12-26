'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/components/ui/toast';
import { Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDate } from '@/lib/date-utils';

interface QuoteRequest {
  id: string;
  bookingNumber: string;
  finalPrice: number;
  scheduledAt: Date;
  notes: string | null;
  product: {
    id: string;
    name: string;
    price: number;
    duration: number;
  };
  customer: {
    id: string;
    name: string | null;
    email: string;
  };
  org: {
    id: string;
    name: string;
    email: string | null;
  } | null;
  package: {
    id: string;
    name: string;
  } | null;
}

interface QuoteRequestsClientProps {
  initialQuoteRequests: QuoteRequest[];
}

export default function QuoteRequestsClient({ initialQuoteRequests }: QuoteRequestsClientProps) {
  const router = useRouter();
  const { success: showSuccess, error: showError } = useToast();
  const [quoteRequests, setQuoteRequests] = useState(initialQuoteRequests);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<QuoteRequest | null>(null);
  const [netTerms, setNetTerms] = useState<string>('');
  const [isApproving, setIsApproving] = useState(false);

  const handleApproveClick = (quote: QuoteRequest) => {
    setSelectedQuote(quote);
    setApproveModalOpen(true);
  };

  const handleApproveConfirm = async () => {
    if (!selectedQuote) return;

    setIsApproving(true);
    try {
      const response = await fetch(`/api/admin/bookings/${selectedQuote.id}/approve-quote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          netTerms: netTerms ? parseInt(netTerms) : undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to approve quote');
      }

      showSuccess('Quote approved successfully!', 3000);
      setApproveModalOpen(false);
      setSelectedQuote(null);
      setNetTerms('');
      router.refresh();
      
      // Remove the approved quote from the list
      setQuoteRequests(quoteRequests.filter((q) => q.id !== selectedQuote.id));
    } catch (error) {
      console.error('Approve quote error:', error);
      showError(error instanceof Error ? error.message : 'Failed to approve quote', 5000);
    } finally {
      setIsApproving(false);
    }
  };

  if (quoteRequests.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-border p-12 text-center">
        <p className="text-sm text-muted-foreground">No quote requests at the moment.</p>
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
                  Organization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground0">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground0">
                  Amount
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
              {quoteRequests.map((quote) => (
                <tr key={quote.id} className="hover:bg-background">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-foreground">
                    <Link
                      href={`/bookings/${quote.id}`}
                      className="text-primary hover:text-primary"
                    >
                      {quote.bookingNumber}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-foreground">
                    <div>
                      <div className="font-medium">{quote.customer.name || 'N/A'}</div>
                      <div className="text-foreground0">{quote.customer.email}</div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-foreground">
                    {quote.org ? (
                      <div>
                        <div className="font-medium">{quote.org.name}</div>
                        {quote.org.email && (
                          <div className="text-foreground0">{quote.org.email}</div>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-foreground">
                    <div>
                      <div className="font-medium">{quote.product.name}</div>
                      <div className="text-foreground0">{quote.product.duration} min</div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-foreground">
                    ${quote.finalPrice.toFixed(2)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-foreground">
                    {formatDate(quote.scheduledAt)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <button
                      onClick={() => handleApproveClick(quote)}
                      className="text-primary hover:text-primary"
                    >
                      Approve
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approve Quote Modal */}
      <Modal isOpen={approveModalOpen} onClose={() => setApproveModalOpen(false)}>
        <ModalHeader>
          <ModalTitle>Approve Quote Request</ModalTitle>
        </ModalHeader>
        <ModalBody>
          {selectedQuote && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  Approve quote for booking <span className="font-medium">{selectedQuote.bookingNumber}</span>?
                </p>
              </div>
              <div className="rounded-lg bg-background p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Customer:</span>
                    <span className="font-medium">{selectedQuote.customer.name || selectedQuote.customer.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Product:</span>
                    <span className="font-medium">{selectedQuote.product.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-semibold">${selectedQuote.finalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
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
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            variant="outline"
            onClick={() => {
              setApproveModalOpen(false);
              setNetTerms('');
            }}
            disabled={isApproving}
          >
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={handleApproveConfirm}
            disabled={isApproving}
            isLoading={isApproving}
          >
            Approve Quote
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
