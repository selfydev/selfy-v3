'use client';

interface BookingReviewStepProps {
  product: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    duration: number;
  };
  formData: {
    selectedPackageId?: string;
    selectedAddOns: Array<{ id: string; quantity: number }>;
    scheduledDate?: string;
    scheduledTime?: string;
    contactName?: string;
    contactEmail?: string;
    contactPhone?: string;
    eventAddress?: string;
    eventType?: string;
    eventNotes?: string;
    hasPowerSupply?: boolean;
    hasParking?: boolean;
    attendeeCount?: number;
    referralSource?: string;
    poNumber?: string;
    costCentre?: string;
    isMultiDay?: boolean;
    multiDayDates?: string[];
    isRecurring?: boolean;
    recurringRule?: string;
    recurringEndDate?: string;
    isBulkBooking?: boolean;
    bulkLocations?: Array<{ address: string; date: string; time: string }>;
    holdSlot?: boolean;
    requestQuote?: boolean;
  };
  packages: Array<{
    id: string;
    name: string;
    permanentDiscountPercent: number;
  }>;
  addOns: Array<{
    id: string;
    name: string;
    price: number;
  }>;
  basePrice: number;
  discountedPrice: number;
  finalPrice: number;
  isCorporateUser: boolean;
  onSubmit: () => void;
  onBack: () => void;
  isLoading: boolean;
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  WEDDING: 'Wedding',
  CORPORATE: 'Corporate Event',
  BIRTHDAY: 'Birthday',
  ANNIVERSARY: 'Anniversary',
  GRADUATION: 'Graduation',
  HOLIDAY: 'Holiday Party',
  OTHER: 'Other',
};

const REFERRAL_LABELS: Record<string, string> = {
  GOOGLE: 'Google Search',
  FACEBOOK: 'Facebook',
  INSTAGRAM: 'Instagram',
  FRIEND: 'Friend/Family',
  PREVIOUS_CLIENT: 'Previous Client',
  OTHER: 'Other',
};

export function BookingReviewStep({
  product,
  formData,
  packages,
  addOns,
  basePrice,
  discountedPrice,
  finalPrice,
  isCorporateUser,
  onSubmit,
  onBack,
  isLoading,
}: BookingReviewStepProps) {
  const selectedPackage = formData.selectedPackageId
    ? packages.find((p) => p.id === formData.selectedPackageId)
    : null;

  const selectedAddOnsList = formData.selectedAddOns
    .map((selection) => {
      const addOn = addOns.find((a) => a.id === selection.id);
      return addOn ? { ...addOn, quantity: selection.quantity } : null;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const eventDate = formData.scheduledDate && formData.scheduledTime
    ? new Date(`${formData.scheduledDate}T${formData.scheduledTime}`)
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Review Your Booking</h2>
        <p className="mt-2 text-muted-foreground">Double-check everything looks good</p>
      </div>

      <div className="space-y-6">
        {/* Product & Package */}
        <div className="rounded-lg border border-border p-4">
          <h3 className="font-semibold text-foreground mb-3">Service</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-foreground">{product.name}</span>
              <span className="font-medium">${basePrice.toFixed(2)}</span>
            </div>
            {isCorporateUser && discountedPrice < basePrice && (
              <div className="flex justify-between text-sm text-primary">
                <span>Corporate Discount</span>
                <span>-${(basePrice - discountedPrice).toFixed(2)}</span>
              </div>
            )}
            {selectedPackage && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{selectedPackage.name}</span>
                {selectedPackage.permanentDiscountPercent > 0 && (
                  <span className="text-primary">
                    +{selectedPackage.permanentDiscountPercent}% extra discount
                  </span>
                )}
              </div>
            )}
            {selectedAddOnsList.length > 0 && (
              <div className="pt-2 border-t border-border mt-2">
                {selectedAddOnsList.map((addOn) => (
                  <div key={addOn.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {addOn.name} {addOn.quantity > 1 && `× ${addOn.quantity}`}
                    </span>
                    <span>${(addOn.price * addOn.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Event Details */}
        <div className="rounded-lg border border-border p-4">
          <h3 className="font-semibold text-foreground mb-3">Event Details</h3>
          <div className="space-y-2 text-sm">
            {eventDate && (
              <div>
                <span className="text-muted-foreground">Date & Time:</span>{' '}
                <span className="font-medium">
                  {eventDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            )}
            {formData.contactName && (
              <div>
                <span className="text-muted-foreground">Contact:</span>{' '}
                <span className="font-medium">{formData.contactName}</span>
              </div>
            )}
            {formData.contactEmail && (
              <div>
                <span className="text-muted-foreground">Email:</span>{' '}
                <span className="font-medium">{formData.contactEmail}</span>
              </div>
            )}
            {formData.contactPhone && (
              <div>
                <span className="text-muted-foreground">Phone:</span>{' '}
                <span className="font-medium">{formData.contactPhone}</span>
              </div>
            )}
            {formData.eventAddress && (
              <div>
                <span className="text-muted-foreground">Address:</span>{' '}
                <span className="font-medium">{formData.eventAddress}</span>
              </div>
            )}
            {formData.eventType && (
              <div>
                <span className="text-muted-foreground">Event Type:</span>{' '}
                <span className="font-medium">{EVENT_TYPE_LABELS[formData.eventType] || formData.eventType}</span>
              </div>
            )}
            {formData.attendeeCount && (
              <div>
                <span className="text-muted-foreground">Attendees:</span>{' '}
                <span className="font-medium">{formData.attendeeCount}</span>
              </div>
            )}
            {(formData.hasPowerSupply || formData.hasParking) && (
              <div>
                <span className="text-muted-foreground">Essentials:</span>{' '}
                <span className="font-medium">
                  {[
                    formData.hasPowerSupply && 'Power Supply',
                    formData.hasParking && 'Parking',
                  ]
                    .filter(Boolean)
                    .join(', ')}
                </span>
              </div>
            )}
            {formData.referralSource && (
              <div>
                <span className="text-muted-foreground">Referral:</span>{' '}
                <span className="font-medium">
                  {REFERRAL_LABELS[formData.referralSource] || formData.referralSource}
                </span>
              </div>
            )}
            {isCorporateUser && formData.poNumber && (
              <div>
                <span className="text-muted-foreground">PO Number:</span>{' '}
                <span className="font-medium">{formData.poNumber}</span>
              </div>
            )}
            {formData.isMultiDay && formData.multiDayDates && (
              <div>
                <span className="text-muted-foreground">Multi-Day Booking:</span>{' '}
                <span className="font-medium">{formData.multiDayDates.length} dates selected</span>
                <ul className="mt-1 ml-4 list-disc text-sm">
                  {formData.multiDayDates.map((date, i) => (
                    <li key={i}>{new Date(date).toLocaleDateString()}</li>
                  ))}
                </ul>
              </div>
            )}
            {formData.isRecurring && formData.recurringRule && (
              <div>
                <span className="text-muted-foreground">Recurring:</span>{' '}
                <span className="font-medium">
                  {formData.recurringRule}
                  {formData.recurringEndDate && ` until ${new Date(formData.recurringEndDate).toLocaleDateString()}`}
                </span>
              </div>
            )}
            {formData.isBulkBooking && formData.bulkLocations && (
              <div>
                <span className="text-muted-foreground">Bulk Booking:</span>{' '}
                <span className="font-medium">{formData.bulkLocations.length} locations</span>
              </div>
            )}
            {formData.holdSlot && (
              <div>
                <span className="text-muted-foreground">Hold Slot:</span>{' '}
                <span className="font-medium text-primary">Reserved without payment</span>
              </div>
            )}
            {isCorporateUser && formData.requestQuote && (
              <div className="p-3 bg-primary-50 rounded-lg border border-primary/20">
                <span className="font-semibold text-primary-800">📋 Quote Request</span>
                <p className="text-sm text-primary mt-1">
                  Your booking will be sent as a quote request for admin approval with net payment terms.
                </p>
              </div>
            )}
            {isCorporateUser && formData.costCentre && (
              <div>
                <span className="text-muted-foreground">Cost Centre:</span>{' '}
                <span className="font-medium">{formData.costCentre}</span>
              </div>
            )}
            {formData.eventNotes && (
              <div className="pt-2 border-t border-border">
                <span className="text-muted-foreground">Notes:</span>{' '}
                <span className="font-medium">{formData.eventNotes}</span>
              </div>
            )}
          </div>
        </div>

        {/* Total */}
        <div className={`rounded-lg border-2 p-4 ${
          isCorporateUser && formData.requestQuote 
            ? 'bg-muted border-border' 
            : 'bg-primary-50 border-primary/20'
        }`}>
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-foreground">
              {isCorporateUser && formData.requestQuote ? 'Quote Amount' : 'Total'}
            </span>
            <span className={`text-3xl font-bold ${
              isCorporateUser && formData.requestQuote ? 'text-primary' : 'text-primary'
            }`}>
              ${finalPrice.toFixed(2)}
            </span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {isCorporateUser && formData.requestQuote 
              ? 'An admin will review your quote request and approve with payment terms (net 30/60/90 days).'
              : 'An admin will review and confirm availability shortly.'}
          </p>
        </div>
      </div>

      <div className="flex justify-between pt-4 border-t border-border">
        <button
          type="button"
          onClick={onBack}
          disabled={isLoading}
          className="px-4 py-2 text-foreground hover:text-foreground font-medium disabled:opacity-50"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={isLoading}
          className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              {isCorporateUser && formData.requestQuote ? 'Submitting Quote...' : 'Submitting...'}
            </>
          ) : (
            isCorporateUser && formData.requestQuote ? 'Submit Quote Request' : 'Confirm Booking'
          )}
        </button>
      </div>
    </div>
  );
}
