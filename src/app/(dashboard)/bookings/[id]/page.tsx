import { getCurrentUser } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import CloneButton from '@/components/bookings/CloneButton';
import { InvoiceButton } from '@/components/bookings/InvoiceButton';
import { PayButton } from '@/components/bookings/PayButton';
import { AdminBookingActions } from '@/components/bookings/AdminBookingActions';

interface BookingDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

// Date formatting helper
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(date);
}

export default async function BookingDetailPage({ params }: BookingDetailPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/auth/signin');
  }

  const { id } = await params;

  // Get booking with all related data
  const booking = await prisma.booking.findUnique({
    where: {
      id,
    },
    include: {
      product: true,
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      assignedStaff: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      org: {
        select: {
          id: true,
          name: true,
        },
      },
      package: {
        select: {
          id: true,
          name: true,
        },
      },
      bookingGroup: {
        select: {
          id: true,
          name: true,
        },
      },
      parentBooking: {
        select: {
          id: true,
          bookingNumber: true,
        },
      },
      childBookings: {
        select: {
          id: true,
          bookingNumber: true,
          scheduledAt: true,
          status: true,
        },
        orderBy: {
          scheduledAt: 'asc',
        },
      },
      addOns: {
        include: {
          addOn: true,
        },
      },
      timeline: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
      payments: {
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  if (!booking) {
    notFound();
  }

  // Check if user has permission to view this booking
  const isOwner = booking.customerId === user.id;
  const isAdmin = user.role === 'ADMIN' || user.role === 'STAFF';
  const isAssignedStaff = booking.assignedStaffId === user.id;

  if (!isOwner && !isAdmin && !isAssignedStaff) {
    redirect('/dashboard?error=insufficient_permissions');
  }

  const statusColors: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-800',
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-blue-100 text-blue-800',
    IN_PROGRESS: 'bg-purple-100 text-purple-800',
    COMPLETED: 'bg-muted text-primary',
    CANCELLED: 'bg-destructive/10 text-destructive',
    NO_SHOW: 'bg-muted text-foreground',
    INVOICED: 'bg-indigo-100 text-indigo-800',
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm text-muted-foreground">
        <Link href="/dashboard" className="hover:text-foreground">
          Dashboard
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{booking.bookingNumber}</span>
      </nav>

      {/* Quote Request Banner */}
      {booking.quoteRequested && (
        <div className="rounded-lg bg-muted border-2 border-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">📋 Quote Request</h3>
              <p className="text-sm text-foreground">
                This is a corporate quote request awaiting admin approval.
                {booking.isCorporate && ' Corporate customers can receive net payment terms upon approval.'}
              </p>
            </div>
            {booking.status === 'PENDING' && (
              <span className="inline-flex items-center rounded-full bg-muted0 px-3 py-1 text-xs font-medium text-white">
                Awaiting Approval
              </span>
            )}
          </div>
        </div>
      )}

      {/* Quote Approved Banner */}
      {booking.quoteApprovedAt && (
        <div className="rounded-lg bg-muted border-2 border-green-400 p-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">✅ Quote Approved</h3>
              <p className="text-sm text-foreground">
                Quote was approved on {formatDate(new Date(booking.quoteApprovedAt))}.
                {booking.netTerms && ` Payment terms: Net ${booking.netTerms} days.`}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Booking Header */}
          <div className="rounded-lg bg-card p-6 shadow">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Booking Details</h1>
                <p className="mt-1 text-sm text-muted-foreground">Booking #{booking.bookingNumber}</p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                    statusColors[booking.status] || statusColors['PENDING']
                  }`}
                >
                  {booking.status.replace('_', ' ')}
                </span>
                {(isAdmin || isOwner) && <CloneButton bookingId={booking.id} />}
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Product</dt>
                <dd className="mt-1 text-sm text-foreground">{booking.product.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Duration</dt>
                <dd className="mt-1 text-sm text-foreground">
                  {booking.product.duration} minutes
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Scheduled Date</dt>
                <dd className="mt-1 text-sm text-foreground">
                  {formatDate(new Date(booking.scheduledAt))}
                </dd>
              </div>
              {booking.completedAt && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Completed Date</dt>
                  <dd className="mt-1 text-sm text-foreground">
                    {formatDate(new Date(booking.completedAt))}
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Final Price</dt>
                <dd className="mt-1 text-lg font-semibold text-foreground">
                  ${booking.finalPrice.toFixed(2)}
                </dd>
              </div>
              {booking.netTerms && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Net Terms</dt>
                  <dd className="mt-1 text-sm text-foreground">{booking.netTerms} days</dd>
                </div>
              )}
            </div>


            {/* Corporate Booking Info */}
          {(booking.isRecurring || booking.bookingGroupId || booking.parentBookingId || booking.childBookings.length > 0) && (
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-6">
              <h3 className="text-base font-semibold text-blue-900 mb-3">Corporate Booking Features</h3>
              <div className="space-y-2 text-sm">
                {booking.isRecurring && (
                  <div>
                    <span className="font-medium text-blue-900">Recurring:</span>{' '}
                    <span className="text-blue-700">{booking.recurringRule || 'N/A'}</span>
                    {booking.recurringEndDate && (
                      <span className="text-blue-700">
                        {' '}until {new Date(booking.recurringEndDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                )}
                {booking.parentBookingId && booking.parentBooking && (
                  <div>
                    <span className="font-medium text-blue-900">Parent Booking:</span>{' '}
                    <Link
                      href={`/bookings/${booking.parentBooking.id}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {booking.parentBooking.bookingNumber}
                    </Link>
                  </div>
                )}
                {booking.childBookings.length > 0 && (
                  <div>
                    <span className="font-medium text-blue-900">Child Bookings:</span>{' '}
                    <span className="text-blue-700">{booking.childBookings.length} occurrences</span>
                    <ul className="mt-1 ml-4 list-disc">
                      {booking.childBookings.slice(0, 5).map((child) => (
                        <li key={child.id}>
                          <Link
                            href={`/bookings/${child.id}`}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            {child.bookingNumber} - {new Date(child.scheduledAt).toLocaleDateString()} ({child.status})
                          </Link>
                        </li>
                      ))}
                      {booking.childBookings.length > 5 && (
                        <li className="text-blue-600">...and {booking.childBookings.length - 5} more</li>
                      )}
                    </ul>
                  </div>
                )}
                {booking.bookingGroupId && booking.bookingGroup && (
                  <div>
                    <span className="font-medium text-blue-900">Bulk Booking Group:</span>{' '}
                    <span className="text-blue-700">{booking.bookingGroup.name || 'Unnamed Group'}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Add-ons */}
          {booking.addOns && booking.addOns.length > 0 && (
            <div className="rounded-lg bg-card p-6 shadow">
              <h3 className="text-base font-semibold text-foreground mb-3">Add-ons</h3>
              <div className="space-y-2">
                {booking.addOns.map((bookingAddOn) => (
                  <div key={bookingAddOn.id} className="flex justify-between text-sm">
                    <span className="text-foreground">
                      {bookingAddOn.addOn.name} × {bookingAddOn.quantity}
                    </span>
                    <span className="font-medium text-foreground">
                      ${(bookingAddOn.price * bookingAddOn.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

            {booking.notes && (
              <div className="mt-6">
                <dt className="text-sm font-medium text-muted-foreground">Notes</dt>
                <dd className="mt-2 text-sm text-foreground whitespace-pre-line">
                  {booking.notes}
                </dd>
              </div>
            )}
          </div>

          {/* Event Details Section */}
          {(booking.contactName || booking.contactEmail || booking.contactPhone || booking.eventAddress || booking.eventType || booking.eventNotes || booking.attendeeCount) && (
            <div className="rounded-lg bg-card p-6 shadow">
              <h2 className="text-lg font-semibold text-foreground mb-4">Event Details</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {booking.contactName && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Contact Name</dt>
                    <dd className="mt-1 text-sm text-foreground">{booking.contactName}</dd>
                  </div>
                )}
                {booking.contactEmail && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Contact Email</dt>
                    <dd className="mt-1 text-sm text-foreground">
                      <a href={`mailto:${booking.contactEmail}`} className="text-primary hover:text-primary">
                        {booking.contactEmail}
                      </a>
                    </dd>
                  </div>
                )}
                {booking.contactPhone && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Contact Phone</dt>
                    <dd className="mt-1 text-sm text-foreground">
                      <a href={`tel:${booking.contactPhone}`} className="text-primary hover:text-primary">
                        {booking.contactPhone}
                      </a>
                    </dd>
                  </div>
                )}
                {booking.eventType && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Event Type</dt>
                    <dd className="mt-1 text-sm text-foreground">{booking.eventType.replace('_', ' ')}</dd>
                  </div>
                )}
                {booking.attendeeCount && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Expected Attendees</dt>
                    <dd className="mt-1 text-sm text-foreground">{booking.attendeeCount}</dd>
                  </div>
                )}
                {(booking.hasPowerSupply || booking.hasParking) && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Facilities</dt>
                    <dd className="mt-1 text-sm text-foreground">
                      {[
                        booking.hasPowerSupply && 'Power Supply Available',
                        booking.hasParking && 'Parking Available',
                      ].filter(Boolean).join(', ')}
                    </dd>
                  </div>
                )}
                {booking.referralSource && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">How They Found Us</dt>
                    <dd className="mt-1 text-sm text-foreground">{booking.referralSource.replace('_', ' ')}</dd>
                  </div>
                )}
                {booking.eventAddress && (
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-muted-foreground">Event Location</dt>
                    <dd className="mt-1 text-sm text-foreground whitespace-pre-line">{booking.eventAddress}</dd>
                  </div>
                )}
                {booking.eventNotes && (
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-muted-foreground">Event Notes</dt>
                    <dd className="mt-1 text-sm text-foreground whitespace-pre-line">{booking.eventNotes}</dd>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Corporate Billing Details */}
          {booking.isCorporate && (booking.poNumber || booking.costCentre || booking.vatRate || booking.invoiceNumber) && (
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-6">
              <h2 className="text-lg font-semibold text-blue-900 mb-4">Billing Information</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {booking.poNumber && (
                  <div>
                    <dt className="text-sm font-medium text-blue-700">PO Number</dt>
                    <dd className="mt-1 text-sm text-blue-900 font-mono">{booking.poNumber}</dd>
                  </div>
                )}
                {booking.costCentre && (
                  <div>
                    <dt className="text-sm font-medium text-blue-700">Cost Centre</dt>
                    <dd className="mt-1 text-sm text-blue-900">{booking.costCentre}</dd>
                  </div>
                )}
                {booking.invoiceNumber && (
                  <div>
                    <dt className="text-sm font-medium text-blue-700">Invoice Number</dt>
                    <dd className="mt-1 text-sm text-blue-900 font-mono">{booking.invoiceNumber}</dd>
                  </div>
                )}
                {booking.vatRate && (
                  <div>
                    <dt className="text-sm font-medium text-blue-700">VAT Rate</dt>
                    <dd className="mt-1 text-sm text-blue-900">{booking.vatRate}%</dd>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Timeline */}
          {booking.timeline.length > 0 && (
            <div className="rounded-lg bg-card p-6 shadow">
              <h2 className="text-lg font-semibold text-foreground">Timeline</h2>
              <div className="mt-4 space-y-4">
                {booking.timeline.map((entry) => (
                  <div key={entry.id} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-medium text-primary">
                          {entry.user?.name?.charAt(0) || 'S'}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{entry.action}</p>
                      {entry.details && (
                        <p className="mt-1 text-sm text-muted-foreground">{entry.details}</p>
                      )}
                      <p className="mt-1 text-xs text-foreground0">
                        {formatDate(new Date(entry.createdAt))}
                        {entry.user && ` by ${entry.user.name || entry.user.email}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Admin Actions */}
          {isAdmin && (
            <AdminBookingActions
              bookingId={booking.id}
              bookingNumber={booking.bookingNumber}
              status={booking.status}
              quoteRequested={booking.quoteRequested}
              isCorporate={booking.isCorporate}
              finalPrice={booking.finalPrice}
            />
          )}

          {/* Customer Info */}
          <div className="rounded-lg bg-card p-6 shadow">
            <h2 className="text-lg font-semibold text-foreground">Customer</h2>
            <div className="mt-4 space-y-2">
              <div>
                <dt className="text-xs font-medium text-muted-foreground">Name</dt>
                <dd className="mt-1 text-sm text-foreground">
                  {booking.customer.name || 'N/A'}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-muted-foreground">Email</dt>
                <dd className="mt-1 text-sm text-foreground">{booking.customer.email}</dd>
              </div>
            </div>
          </div>

          {/* Staff Assignment */}
          {booking.assignedStaff && (
            <div className="rounded-lg bg-card p-6 shadow">
              <h2 className="text-lg font-semibold text-foreground">Assigned Staff</h2>
              <div className="mt-4 space-y-2">
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">Name</dt>
                  <dd className="mt-1 text-sm text-foreground">
                    {booking.assignedStaff.name || 'N/A'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">Email</dt>
                  <dd className="mt-1 text-sm text-foreground">{booking.assignedStaff.email}</dd>
                </div>
              </div>
            </div>
          )}

          {/* Corporate Info */}
          {booking.org && (
            <div className="rounded-lg bg-card p-6 shadow">
              <h2 className="text-lg font-semibold text-foreground">Corporate Organization</h2>
              <div className="mt-4">
                <p className="text-sm text-foreground">{booking.org.name}</p>
              </div>
              {booking.package && (
                <div className="mt-4">
                  <dt className="text-xs font-medium text-muted-foreground">Package Used</dt>
                  <dd className="mt-1 text-sm text-foreground">{booking.package.name}</dd>
                </div>
              )}
            </div>
          )}

          {/* Payments */}
          {booking.payments.length > 0 && (
            <div className="rounded-lg bg-card p-6 shadow">
              <h2 className="text-lg font-semibold text-foreground">Payments</h2>
              <div className="mt-4 space-y-3">
                {booking.payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="border-t border-border pt-3 first:border-t-0 first:pt-0"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          ${payment.amount.toFixed(2)}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {payment.status.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                    {payment.processedAt && (
                      <p className="mt-2 text-xs text-foreground0">
                        {formatDate(new Date(payment.processedAt))}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment Actions */}
          {!booking.isCorporate && booking.status !== 'CONFIRMED' && !booking.payments.some((p: any) => p.status === 'COMPLETED') && (
            <div className="rounded-lg bg-card p-6 shadow">
              <PayButton
                bookingId={booking.id}
                finalPrice={booking.finalPrice}
                isCorporate={booking.isCorporate}
                currentStatus={booking.status}
                hasCompletedPayment={booking.payments.some((p: any) => p.status === 'COMPLETED')}
              />
            </div>
          )}

          {/* Invoice Actions */}
          {booking.isCorporate && (user.role === 'ADMIN' || user.role === 'STAFF') && (
            <div className="rounded-lg bg-card p-6 shadow">
              <InvoiceButton
                bookingId={booking.id}
                isCorporate={booking.isCorporate}
                invoiceNumber={booking.invoiceNumber}
                currentStatus={booking.status}
                userRole={user.role}
              />
            </div>
          )}

          {/* Download Invoice Link */}
          {booking.isCorporate && booking.status === 'INVOICED' && (
            <div className="rounded-lg bg-card p-6 shadow">
              <a
                href={`/api/bookings/${booking.id}/invoice/download`}
                target="_blank"
                className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium transition-colors w-full justify-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Invoice
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
