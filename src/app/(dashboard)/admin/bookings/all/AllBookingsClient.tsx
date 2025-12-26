'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { formatDate, formatDateTime, formatTime } from '@/lib/date-utils';

interface Booking {
  id: string;
  bookingNumber: string;
  finalPrice: number;
  scheduledAt: Date;
  completedAt: Date | null;
  createdAt: Date;
  notes: string | null;
  status: string;
  isCorporate: boolean;
  quoteRequested: boolean;
  netTerms: number | null;
  quoteApprovedAt: Date | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  eventAddress: string | null;
  eventType: string | null;
  poNumber: string | null;
  costCentre: string | null;
  invoiceNumber: string | null;
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
    phone: string | null;
    role: string;
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
  assignedStaff: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  payments: Array<{
    id: string;
    amount: number;
    status: string;
    createdAt: Date;
  }>;
  quoteApprovedBy: {
    id: string;
    name: string | null;
  } | null;
}

interface AllBookingsClientProps {
  initialBookings: Booking[];
  statusCounts: Record<string, number>;
  currentStatus: string;
  currentSearch: string;
  currentCorporateFilter: string;
}

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-purple-100 text-purple-800',
  COMPLETED: 'bg-muted text-foreground',
  CANCELLED: 'bg-red-100 text-red-800',
  NO_SHOW: 'bg-muted text-foreground',
  INVOICED: 'bg-indigo-100 text-indigo-800',
};

const STATUS_LABELS: Record<string, string> = {
  all: 'All Bookings',
  DRAFT: 'Draft',
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  INVOICED: 'Invoiced',
};

export default function AllBookingsClient({
  initialBookings,
  statusCounts,
  currentStatus,
  currentSearch,
  currentCorporateFilter,
}: AllBookingsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(currentSearch);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const updateFilters = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== 'all') {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    router.push(`/admin/bookings/all?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchQuery });
  };

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setDetailModalOpen(true);
  };

  const exportToCSV = () => {
    const headers = [
      'Booking #',
      'Status',
      'Customer Name',
      'Customer Email',
      'Customer Phone',
      'Product',
      'Amount',
      'Scheduled Date',
      'Corporate',
      'Organization',
      'PO Number',
      'Invoice #',
      'Created',
    ];

    const rows = initialBookings.map((b) => [
      b.bookingNumber,
      b.status,
      b.customer.name || b.contactName || '',
      b.customer.email || b.contactEmail || '',
      b.customer.phone || b.contactPhone || '',
      b.product.name,
      b.finalPrice.toFixed(2),
      formatDate(b.scheduledAt),
      b.isCorporate ? 'Yes' : 'No',
      b.org?.name || '',
      b.poNumber || '',
      b.invoiceNumber || '',
      formatDate(b.createdAt),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `bookings-${currentStatus}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <>
      {/* Filters */}
      <div className="space-y-4">
        {/* Status Tabs */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(STATUS_LABELS).map(([status, label]) => (
            <button
              key={status}
              onClick={() => updateFilters({ status })}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentStatus === status
                  ? 'bg-primary text-white'
                  : 'bg-card text-foreground border border-border hover:bg-background'
              }`}
            >
              {label}
              <span className="ml-2 text-xs opacity-75">({statusCounts[status] || 0})</span>
            </button>
          ))}
        </div>

        {/* Search and Additional Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          <form onSubmit={handleSearch} className="flex-1 min-w-[300px]">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by booking #, customer name, email, or organization..."
                className="w-full rounded-lg border border-border px-4 py-2 pr-10 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-muted-foreground"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </form>

          <select
            value={currentCorporateFilter}
            onChange={(e) => updateFilters({ corporate: e.target.value })}
            className="rounded-lg border border-border px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Customers</option>
            <option value="corporate">Corporate Only</option>
            <option value="regular">Regular Only</option>
          </select>

          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-background"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Showing {initialBookings.length} booking{initialBookings.length !== 1 ? 's' : ''}
        {currentSearch && <span> matching &quot;{currentSearch}&quot;</span>}
      </div>

      {/* Bookings Table */}
      <div className="rounded-lg bg-card shadow overflow-hidden w-full">
        <div className="overflow-x-auto max-w-full">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-background">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground0">
                  Booking #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground0">
                  Status
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
              {initialBookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="text-4xl mb-4">📋</div>
                    <p className="text-lg font-medium text-foreground">No bookings found</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {currentSearch
                        ? 'Try adjusting your search or filters'
                        : 'No bookings match the current filter'}
                    </p>
                  </td>
                </tr>
              ) : (
                initialBookings.map((booking) => {
                  const totalPaid = booking.payments
                    .filter((p) => p.status === 'COMPLETED')
                    .reduce((sum, p) => sum + p.amount, 0);
                  const isPaidInFull = totalPaid >= booking.finalPrice;

                  return (
                    <tr key={booking.id} className="hover:bg-background">
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                        <Link
                          href={`/bookings/${booking.id}`}
                          className="text-primary hover:text-primary"
                        >
                          {booking.bookingNumber}
                        </Link>
                        {booking.invoiceNumber && (
                          <div className="text-xs text-foreground0 mt-1">
                            INV: {booking.invoiceNumber}
                          </div>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            STATUS_COLORS[booking.status] || STATUS_COLORS['PENDING']
                          }`}
                        >
                          {booking.status.replace('_', ' ')}
                        </span>
                        {booking.quoteRequested && (
                          <span className="ml-1 inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
                            Quote
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <div>
                          <div className="font-medium text-foreground">
                            {booking.customer.name || booking.contactName || 'N/A'}
                          </div>
                          <div className="text-foreground0">{booking.customer.email}</div>
                          {booking.isCorporate && booking.org && (
                            <div className="text-xs text-primary font-medium">
                              🏢 {booking.org.name}
                            </div>
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
                        {booking.netTerms && (
                          <div className="text-xs font-normal text-foreground0">
                            Net {booking.netTerms}
                          </div>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        {isPaidInFull ? (
                          <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground">
                            ✓ Paid
                          </span>
                        ) : totalPaid > 0 ? (
                          <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                            ${totalPaid.toFixed(0)} paid
                          </span>
                        ) : booking.isCorporate ? (
                          <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground">
                            Invoice
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                            Unpaid
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-foreground">
                        <div>
                          <div>{formatDate(booking.scheduledAt)}</div>
                          <div className="text-xs text-foreground0">
                            {formatTime(booking.scheduledAt)}
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleViewDetails(booking)}
                            className="text-primary hover:text-primary"
                          >
                            Details
                          </button>
                          <Link
                            href={`/bookings/${booking.id}`}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            View
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Details Modal */}
      <Modal isOpen={detailModalOpen} onClose={() => setDetailModalOpen(false)}>
        <ModalHeader>
          <ModalTitle>Booking Details</ModalTitle>
        </ModalHeader>
        <ModalBody>
          {selectedBooking && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{selectedBooking.bookingNumber}</h3>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      STATUS_COLORS[selectedBooking.status]
                    }`}
                  >
                    {selectedBooking.status}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    ${selectedBooking.finalPrice.toFixed(2)}
                  </div>
                  {selectedBooking.netTerms && (
                    <div className="text-sm text-foreground0">Net {selectedBooking.netTerms} days</div>
                  )}
                </div>
              </div>

              {/* Customer Info */}
              <div className="rounded-lg bg-background p-4">
                <h4 className="font-medium text-foreground mb-3">Customer Information</h4>
                <dl className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <dt className="text-foreground0">Name</dt>
                    <dd className="font-medium">{selectedBooking.customer.name || selectedBooking.contactName || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-foreground0">Email</dt>
                    <dd className="font-medium">{selectedBooking.customer.email || selectedBooking.contactEmail}</dd>
                  </div>
                  <div>
                    <dt className="text-foreground0">Phone</dt>
                    <dd className="font-medium">{selectedBooking.customer.phone || selectedBooking.contactPhone || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-foreground0">Type</dt>
                    <dd className="font-medium">{selectedBooking.isCorporate ? 'Corporate' : 'Regular'}</dd>
                  </div>
                  {selectedBooking.org && (
                    <>
                      <div className="col-span-2">
                        <dt className="text-foreground0">Organization</dt>
                        <dd className="font-medium">{selectedBooking.org.name}</dd>
                      </div>
                    </>
                  )}
                </dl>
              </div>

              {/* Event Details */}
              <div className="rounded-lg bg-background p-4">
                <h4 className="font-medium text-foreground mb-3">Event Details</h4>
                <dl className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <dt className="text-foreground0">Product</dt>
                    <dd className="font-medium">{selectedBooking.product.name}</dd>
                  </div>
                  <div>
                    <dt className="text-foreground0">Duration</dt>
                    <dd className="font-medium">{selectedBooking.product.duration} minutes</dd>
                  </div>
                  <div>
                    <dt className="text-foreground0">Scheduled</dt>
                    <dd className="font-medium">{formatDateTime(selectedBooking.scheduledAt)}</dd>
                  </div>
                  {selectedBooking.completedAt && (
                    <div>
                      <dt className="text-foreground0">Completed</dt>
                      <dd className="font-medium">{formatDateTime(selectedBooking.completedAt)}</dd>
                    </div>
                  )}
                  {selectedBooking.eventAddress && (
                    <div className="col-span-2">
                      <dt className="text-foreground0">Address</dt>
                      <dd className="font-medium">{selectedBooking.eventAddress}</dd>
                    </div>
                  )}
                  {selectedBooking.eventType && (
                    <div>
                      <dt className="text-foreground0">Event Type</dt>
                      <dd className="font-medium">{selectedBooking.eventType}</dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* Corporate/Invoice Details */}
              {selectedBooking.isCorporate && (
                <div className="rounded-lg bg-blue-50 p-4">
                  <h4 className="font-medium text-blue-900 mb-3">Corporate Details</h4>
                  <dl className="grid grid-cols-2 gap-2 text-sm">
                    {selectedBooking.poNumber && (
                      <div>
                        <dt className="text-blue-700">PO Number</dt>
                        <dd className="font-medium text-blue-900">{selectedBooking.poNumber}</dd>
                      </div>
                    )}
                    {selectedBooking.costCentre && (
                      <div>
                        <dt className="text-blue-700">Cost Centre</dt>
                        <dd className="font-medium text-blue-900">{selectedBooking.costCentre}</dd>
                      </div>
                    )}
                    {selectedBooking.invoiceNumber && (
                      <div>
                        <dt className="text-blue-700">Invoice #</dt>
                        <dd className="font-medium text-blue-900">{selectedBooking.invoiceNumber}</dd>
                      </div>
                    )}
                    {selectedBooking.package && (
                      <div>
                        <dt className="text-blue-700">Package</dt>
                        <dd className="font-medium text-blue-900">{selectedBooking.package.name}</dd>
                      </div>
                    )}
                    {selectedBooking.quoteApprovedBy && (
                      <div>
                        <dt className="text-blue-700">Quote Approved By</dt>
                        <dd className="font-medium text-blue-900">
                          {selectedBooking.quoteApprovedBy.name || 'Admin'}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              )}

              {/* Payment History */}
              {selectedBooking.payments.length > 0 && (
                <div className="rounded-lg bg-muted p-4">
                  <h4 className="font-medium text-foreground mb-3">Payment History</h4>
                  <div className="space-y-2">
                    {selectedBooking.payments.map((payment) => (
                      <div key={payment.id} className="flex justify-between text-sm">
                        <span className="text-primary">
                          {formatDate(payment.createdAt)} - {payment.status}
                        </span>
                        <span className="font-medium text-foreground">${payment.amount.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedBooking.notes && (
                <div className="rounded-lg bg-background p-4">
                  <h4 className="font-medium text-foreground mb-2">Notes</h4>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{selectedBooking.notes}</p>
                </div>
              )}

              {/* Timestamps */}
              <div className="text-xs text-foreground0 border-t pt-4">
                <p>Created: {formatDateTime(selectedBooking.createdAt)}</p>
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setDetailModalOpen(false)}>
            Close
          </Button>
          {selectedBooking && (
            <Link href={`/bookings/${selectedBooking.id}`}>
              <Button variant="default">View Full Details</Button>
            </Link>
          )}
        </ModalFooter>
      </Modal>
    </>
  );
}

