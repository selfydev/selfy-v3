'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/toast';

interface CorporatePackage {
  id: string;
  name: string;
  totalCredits: number;
  usedCredits: number;
  permanentDiscountPercent: number;
}

interface BookProductFormProps {
  productId: string;
  basePrice: number;
  discountedPrice: number;
  orgId?: string;
  packages?: CorporatePackage[];
  isCorporateUser: boolean;
}

export function BookProductForm({
  productId,
  basePrice,
  discountedPrice,
  orgId,
  packages = [],
  isCorporateUser,
}: BookProductFormProps) {
  const router = useRouter();
  const { success: showSuccess, error: showError } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string>('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [notes, setNotes] = useState('');

  // Calculate final price based on selected package
  const calculateFinalPrice = () => {
    if (!selectedPackage) return discountedPrice;

    const pkg = packages.find((p) => p.id === selectedPackage);
    if (!pkg) return discountedPrice;

    // Apply package's additional discount
    if (pkg.permanentDiscountPercent > 0) {
      return discountedPrice * (1 - pkg.permanentDiscountPercent / 100);
    }

    return discountedPrice;
  };

  const finalPrice = calculateFinalPrice();

  const handleSubmit = async (e: React.FormEvent, isDraft = false) => {
    e.preventDefault();

    // Date/time is required unless it's a draft
    if (!isDraft && (!scheduledDate || !scheduledTime)) {
      showError('Please select date and time', 3000);
      return;
    }

    if (isDraft) {
      setIsSavingDraft(true);
    } else {
      setIsLoading(true);
    }

    try {
      const scheduledAt = scheduledDate && scheduledTime ? new Date(`${scheduledDate}T${scheduledTime}`) : null;

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          scheduledAt: scheduledAt?.toISOString(),
          notes,
          orgId,
          packageId: selectedPackage || undefined,
          finalPrice,
          isDraft,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create booking');
      }

      const data = await response.json();
      
      if (isDraft) {
        showSuccess('Draft saved successfully!', 3000);
      } else {
        showSuccess('Booking request submitted! An admin will review and confirm availability shortly.', 5000);
      }
      router.push(`/bookings/${data.booking.id}`);
    } catch (error) {
      console.error('Booking error:', error);
      showError(error instanceof Error ? error.message : 'Failed to create booking', 5000);
    } finally {
      setIsLoading(false);
      setIsSavingDraft(false);
    }
  };

  // Get minimum date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <form onSubmit={(e) => e.preventDefault()} className="mt-4 space-y-4">
      {/* Package Selection */}
      {isCorporateUser && packages.length > 0 && (
        <div>
          <label htmlFor="package" className="block text-sm font-medium text-foreground">
            Use Package (Optional)
          </label>
          <select
            id="package"
            value={selectedPackage}
            onChange={(e) => setSelectedPackage(e.target.value)}
            className="mt-1 block w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">Pay full price</option>
            {packages.map((pkg) => {
              const remaining = pkg.totalCredits - pkg.usedCredits;
              return (
                <option key={pkg.id} value={pkg.id} disabled={remaining === 0}>
                  {pkg.name} ({remaining} credits)
                  {pkg.permanentDiscountPercent > 0 &&
                    ` - Extra ${pkg.permanentDiscountPercent}% off`}
                </option>
              );
            })}
          </select>
        </div>
      )}

      {/* Date Selection */}
      <div>
        <label htmlFor="date" className="block text-sm font-medium text-foreground">
          Preferred Date <span className="text-foreground0">(optional for drafts)</span>
        </label>
        <input
          type="date"
          id="date"
          min={minDate}
          value={scheduledDate}
          onChange={(e) => setScheduledDate(e.target.value)}
          className="mt-1 block w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Time Selection */}
      <div>
        <label htmlFor="time" className="block text-sm font-medium text-foreground">
          Preferred Time <span className="text-foreground0">(optional for drafts)</span>
        </label>
        <input
          type="time"
          id="time"
          value={scheduledTime}
          onChange={(e) => setScheduledTime(e.target.value)}
          className="mt-1 block w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-foreground">
          Special Requests (Optional)
        </label>
        <textarea
          id="notes"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any special requests or requirements..."
          className="mt-1 block w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Price Summary */}
      <div className="border-t border-border pt-4">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Base Price:</span>
            <span>${basePrice.toFixed(2)}</span>
          </div>
          {isCorporateUser && discountedPrice < basePrice && (
            <div className="flex justify-between text-primary">
              <span>Corporate Discount:</span>
              <span>-${(basePrice - discountedPrice).toFixed(2)}</span>
            </div>
          )}
          {selectedPackage && finalPrice < discountedPrice && (
            <div className="flex justify-between text-primary">
              <span>Package Discount:</span>
              <span>-${(discountedPrice - finalPrice).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold text-foreground border-t border-border pt-2">
            <span>Total:</span>
            <span>${finalPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        {/* Primary Request Booking Button */}
        <button
          type="button"
          onClick={(e) => handleSubmit(e, false)}
          disabled={isLoading || isSavingDraft}
          className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Processing...' : 'Request Booking'}
        </button>

        {/* Save as Draft Button */}
        <button
          type="button"
          onClick={(e) => handleSubmit(e, true)}
          disabled={isLoading || isSavingDraft}
          className="w-full rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSavingDraft ? 'Saving...' : 'Save as Draft'}
        </button>
      </div>
    </form>
  );
}
