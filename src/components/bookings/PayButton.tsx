'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/toast';
import { StripeProvider } from '@/components/payments/StripeProvider';
import { EmbeddedPaymentForm } from '@/components/payments/EmbeddedPaymentForm';

interface PayButtonProps {
  bookingId: string;
  finalPrice: number;
  isCorporate: boolean;
  currentStatus: string;
  hasCompletedPayment: boolean;
}

export function PayButton({
  bookingId,
  finalPrice,
  isCorporate,
  currentStatus,
  hasCompletedPayment,
}: PayButtonProps) {
  const router = useRouter();
  const { success: showSuccess, error: showError } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentType, setPaymentType] = useState<'full' | 'deposit' | null>(null);

  const initiatePayment = async (depositOnly: boolean) => {
    if (isCorporate) {
      showError('Corporate bookings require invoicing, not direct payment', 5000);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          amount: finalPrice,
          depositOnly,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to initiate payment');
      }

      const data = await response.json();
      setClientSecret(data.clientSecret);
      setPaymentAmount(data.amount);
      setPaymentType(depositOnly ? 'deposit' : 'full');
    } catch (error) {
      console.error('Payment error:', error);
      showError(error instanceof Error ? error.message : 'Failed to initiate payment', 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccess = () => {
    showSuccess('Payment successful! Your booking is now confirmed.', 5000);
    setClientSecret(null);
    setPaymentType(null);
    router.refresh();
  };

  const handleError = (error: string) => {
    showError(error, 5000);
  };

  const handleCancel = () => {
    setClientSecret(null);
    setPaymentType(null);
    setPaymentAmount(0);
  };

  // Don't show for corporate bookings or if already paid/confirmed
  if (isCorporate || currentStatus === 'CONFIRMED' || currentStatus === 'COMPLETED' || hasCompletedPayment) {
    return null;
  }

  // Show embedded payment form when clientSecret is available
  if (clientSecret) {
    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-border pb-3">
          <div>
            <h3 className="font-semibold text-foreground">
              {paymentType === 'deposit' ? 'Pay 50% Deposit' : 'Pay Full Amount'}
            </h3>
            <p className="text-sm text-foreground0">Secure payment powered by Stripe</p>
          </div>
          <button
            onClick={handleCancel}
            className="text-sm text-foreground0 hover:text-foreground px-3 py-1 rounded hover:bg-muted transition-colors"
          >
            ← Back
          </button>
        </div>

        {/* Embedded Payment Form */}
        <StripeProvider clientSecret={clientSecret}>
          <EmbeddedPaymentForm
            bookingId={bookingId}
            amount={paymentAmount}
            onSuccess={handleSuccess}
            onError={handleError}
          />
        </StripeProvider>
      </div>
    );
  }

  // Show payment options
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-foreground">Payment Options</h3>
        <p className="text-sm text-foreground0 mt-1">
          Choose to pay a deposit or the full amount now
        </p>
      </div>

      <div className="space-y-3">
        {/* Deposit Option */}
        <button
          onClick={() => initiatePayment(true)}
          disabled={isLoading}
          className="w-full flex items-center justify-between p-4 border-2 border-border rounded-lg hover:border-primary/30 hover:bg-primary-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          <div className="text-left">
            <div className="font-medium text-foreground group-hover:text-primary">
              Pay 50% Deposit
            </div>
            <div className="text-sm text-foreground0">
              Secure your booking now, pay the rest later
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-primary">
              ${(finalPrice * 0.5).toFixed(2)}
            </div>
          </div>
        </button>

        {/* Full Payment Option */}
        <button
          onClick={() => initiatePayment(false)}
          disabled={isLoading}
          className="w-full flex items-center justify-between p-4 border-2 border-primary-500 bg-primary-50 rounded-lg hover:bg-primary/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          <div className="text-left">
            <div className="font-medium text-primary-900">
              Pay Full Amount
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-foreground">
                Recommended
              </span>
            </div>
            <div className="text-sm text-primary">
              Complete payment and confirm your booking
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-primary">
              ${finalPrice.toFixed(2)}
            </div>
          </div>
        </button>
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex items-center justify-center gap-2 text-sm text-foreground0">
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Preparing payment...</span>
        </div>
      )}

      {/* Security note */}
      <p className="text-xs text-center text-muted-foreground">
        🔒 All payments are processed securely through Stripe
      </p>
    </div>
  );
}
