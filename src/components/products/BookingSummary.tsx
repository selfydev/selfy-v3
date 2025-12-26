'use client';

interface BookingSummaryProps {
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
    eventAddress?: string;
    attendeeCount?: number;
    isMultiDay?: boolean;
    multiDayDates?: string[];
    isRecurring?: boolean;
    recurringRule?: string;
    isBulkBooking?: boolean;
    bulkLocations?: Array<{ address: string; date: string; time: string }>;
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
}

export function BookingSummary({
  product,
  formData,
  packages,
  addOns,
  basePrice,
  discountedPrice,
  finalPrice,
  isCorporateUser,
}: BookingSummaryProps) {
  const selectedPackage = formData.selectedPackageId
    ? packages.find((p) => p.id === formData.selectedPackageId)
    : null;

  const selectedAddOnsList = formData.selectedAddOns
    .map((selection) => {
      const addOn = addOns.find((a) => a.id === selection.id);
      return addOn ? { ...addOn, quantity: selection.quantity } : null;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  return (
    <div className="sticky top-6 rounded-lg bg-card p-6 shadow-lg border border-border">
      <h3 className="text-lg font-semibold text-foreground mb-4">Your Booking</h3>

      <div className="space-y-4">
        {/* Product */}
        <div>
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium text-foreground">{product.name}</p>
              <p className="text-sm text-muted-foreground mt-1">{product.duration} minutes</p>
            </div>
            <p className="font-medium text-foreground">${basePrice.toFixed(2)}</p>
          </div>
        </div>

        {/* Corporate Discount */}
        {isCorporateUser && discountedPrice < basePrice && (
          <div className="pt-2 border-t border-border">
            <div className="flex justify-between text-sm">
              <span className="text-primary">Corporate Discount</span>
              <span className="text-primary">
                -${(basePrice - discountedPrice).toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* Package */}
        {selectedPackage && (
          <div className="pt-2 border-t border-border">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-foreground">{selectedPackage.name}</p>
                {selectedPackage.permanentDiscountPercent > 0 && (
                  <p className="text-xs text-primary mt-1">
                    +{selectedPackage.permanentDiscountPercent}% extra discount
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Add-ons */}
        {selectedAddOnsList.length > 0 && (
          <div className="pt-2 border-t border-border">
            <p className="text-sm font-medium text-foreground mb-2">Add-ons</p>
            <div className="space-y-2">
              {selectedAddOnsList.map((addOn) => (
                <div key={addOn.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {addOn.name} {addOn.quantity > 1 && `× ${addOn.quantity}`}
                  </span>
                  <span className="text-foreground">
                    ${(addOn.price * addOn.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Event Details Preview */}
        {(formData.scheduledDate ||
          formData.contactName ||
          formData.eventAddress ||
          formData.attendeeCount) && (
          <div className="pt-4 border-t border-border">
            <p className="text-sm font-medium text-foreground mb-2">Event Details</p>
            <div className="space-y-1 text-sm text-muted-foreground">
              {formData.scheduledDate && formData.scheduledTime && (
                <div className="space-y-1">
                  <p className="font-semibold text-foreground">
                    {new Date(formData.scheduledDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  <p className="font-semibold text-foreground">
                    {new Date(`2000-01-01T${formData.scheduledTime}`).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              )}
              {formData.contactName && <p>Contact: {formData.contactName}</p>}
              {formData.attendeeCount && <p>{formData.attendeeCount} attendees</p>}
              {formData.isMultiDay && formData.multiDayDates && (
                <p className="text-primary font-medium">
                  📅 Multi-day: {formData.multiDayDates.length} dates
                </p>
              )}
              {formData.isRecurring && formData.recurringRule && (
                <p className="text-primary font-medium">
                  🔄 Recurring: {formData.recurringRule}
                </p>
              )}
              {formData.isBulkBooking && formData.bulkLocations && (
                <p className="text-primary font-medium">
                  📦 Bulk: {formData.bulkLocations.length} locations
                </p>
              )}
              {isCorporateUser && formData.requestQuote && (
                <p className="text-primary font-medium">
                  📋 Quote Request
                </p>
              )}
            </div>
          </div>
        )}

        {/* Total */}
        <div className="pt-4 border-t-2 border-border">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-foreground">Total</span>
            <span className="text-2xl font-bold text-primary">${finalPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
