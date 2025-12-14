'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!scheduledDate || !scheduledTime) {
      showError('Please select date and time', 3000);
      return;
    }

    setIsLoading(true);

    try {
      const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`);

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          scheduledAt: scheduledAt.toISOString(),
          notes,
          orgId,
          packageId: selectedPackage || undefined,
          finalPrice,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create booking');
      }

      const data = await response.json();
      showSuccess('Booking created successfully!', 3000);
      router.push(`/bookings/${data.booking.id}`);
    } catch (error) {
      console.error('Booking error:', error);
      showError(error instanceof Error ? error.message : 'Failed to create booking', 5000);
    } finally {
      setIsLoading(false);
    }
  };

  // Get minimum date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      {/* Package Selection */}
      {isCorporateUser && packages.length > 0 && (
        <div>
          <label htmlFor="package" className="block text-sm font-medium text-neutral-700">
            Use Package (Optional)
          </label>
          <select
            id="package"
            value={selectedPackage}
            onChange={(e) => setSelectedPackage(e.target.value)}
            className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
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
        <label htmlFor="date" className="block text-sm font-medium text-neutral-700">
          Preferred Date *
        </label>
        <input
          type="date"
          id="date"
          required
          min={minDate}
          value={scheduledDate}
          onChange={(e) => setScheduledDate(e.target.value)}
          className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
      </div>

      {/* Time Selection */}
      <div>
        <label htmlFor="time" className="block text-sm font-medium text-neutral-700">
          Preferred Time *
        </label>
        <input
          type="time"
          id="time"
          required
          value={scheduledTime}
          onChange={(e) => setScheduledTime(e.target.value)}
          className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-neutral-700">
          Special Requests (Optional)
        </label>
        <textarea
          id="notes"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any special requests or requirements..."
          className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
      </div>

      {/* Price Summary */}
      <div className="border-t border-neutral-200 pt-4">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-neutral-600">
            <span>Base Price:</span>
            <span>${basePrice.toFixed(2)}</span>
          </div>
          {isCorporateUser && discountedPrice < basePrice && (
            <div className="flex justify-between text-success-dark">
              <span>Corporate Discount:</span>
              <span>-${(basePrice - discountedPrice).toFixed(2)}</span>
            </div>
          )}
          {selectedPackage && finalPrice < discountedPrice && (
            <div className="flex justify-between text-success-dark">
              <span>Package Discount:</span>
              <span>-${(discountedPrice - finalPrice).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold text-neutral-900 border-t border-neutral-200 pt-2">
            <span>Total:</span>
            <span>${finalPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Processing...' : 'Book Now'}
      </button>
    </form>
  );
}
