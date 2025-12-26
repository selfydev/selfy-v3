'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/toast';
import { StripeProvider } from '@/components/payments/StripeProvider';
import { EmbeddedPaymentForm } from '@/components/payments/EmbeddedPaymentForm';

interface PaymentStepProps {
  bookingId: string;
  finalPrice: number;
  isCorporate: boolean;
  onBack: () => void;
}

export function PaymentStep({
  bookingId,
  finalPrice,
  isCorporate,
  onBack,
}: PaymentStepProps) {
  const { success: showSuccess, error: showError } = useToast();
  const router = useRouter();
  const [paymentType, setPaymentType] = useState<'deposit' | 'full'>('full');
  const [isLoading, setIsLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);

  const initiatePayment = async () => {
    if (isCorporate) {
      router.push(`/bookings/${bookingId}`);
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
          depositOnly: paymentType === 'deposit',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to initiate payment');
      }

      const data = await response.json();
      setClientSecret(data.clientSecret);
      setPaymentAmount(data.amount);
    } catch (error) {
      console.error('Payment error:', error);
      showError(error instanceof Error ? error.message : 'Failed to initiate payment', 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    showSuccess('Payment successful! Your booking is confirmed.', 5000);
    router.push(`/bookings/${bookingId}?payment=success`);
  };

  const handlePaymentError = (error: string) => {
    showError(error, 5000);
  };

  const handleBackToOptions = () => {
    setClientSecret(null);
    setPaymentAmount(0);
  };

  // Corporate invoice flow
  if (isCorporate) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Invoice Processing</h2>
          <p className="mt-2 text-muted-foreground">
            Your corporate booking will be processed via invoice. An admin will review and send you an invoice shortly.
          </p>
        </div>

        <div className="rounded-lg bg-primary-50 border-2 border-primary/20 p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold text-foreground">Total Amount</span>
            <span className="text-3xl font-bold text-primary">${finalPrice.toFixed(2)}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            You'll receive an invoice via email with payment instructions and terms.
          </p>
        </div>

        <div className="flex justify-between pt-4 border-t border-border">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 text-foreground hover:text-foreground font-medium"
          >
            ← Back
          </button>
          <button
            type="button"
            onClick={() => router.push(`/bookings/${bookingId}`)}
            className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 font-semibold transition-colors"
          >
            View Booking →
          </button>
        </div>
      </div>
    );
  }

  // Embedded payment form
  if (clientSecret) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Complete Payment</h2>
            <p className="mt-1 text-muted-foreground">
              {paymentType === 'deposit' ? 'Paying 50% deposit' : 'Paying full amount'}
            </p>
          </div>
          <button
            onClick={handleBackToOptions}
            className="text-sm text-foreground0 hover:text-foreground px-3 py-1 rounded hover:bg-muted transition-colors"
          >
            ← Change amount
          </button>
        </div>

        <StripeProvider clientSecret={clientSecret}>
          <EmbeddedPaymentForm
            bookingId={bookingId}
            amount={paymentAmount}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
          />
        </StripeProvider>

        <div className="flex justify-start pt-4 border-t border-border">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 text-foreground hover:text-foreground font-medium"
          >
            ← Back to Review
          </button>
        </div>
      </div>
    );
  }

  // Payment option selection
  const depositAmount = finalPrice * 0.5;
  const selectedAmount = paymentType === 'deposit' ? depositAmount : finalPrice;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Complete Payment</h2>
        <p className="mt-2 text-muted-foreground">Choose your payment option</p>
      </div>

      <div className="space-y-4">
        {/* Payment Type Selection */}
        <div className="space-y-3">
          {/* Full Payment Option */}
          <button
            type="button"
            onClick={() => setPaymentType('full')}
            className={`w-full flex items-center justify-between p-5 border-2 rounded-xl transition-all ${
              paymentType === 'full'
                ? 'border-primary-500 bg-primary-50 ring-2 ring-primary/20'
                : 'border-border hover:border-border hover:bg-background'
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  paymentType === 'full' ? 'border-primary bg-primary' : 'border-border'
                }`}
              >
                {paymentType === 'full' && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <div className="text-left">
                <div className="font-semibold text-foreground">Pay in Full</div>
                <div className="text-sm text-foreground0">Complete payment now</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-foreground">${finalPrice.toFixed(2)}</div>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-foreground">
                Recommended
              </span>
            </div>
          </button>

          {/* Deposit Option */}
          <button
            type="button"
            onClick={() => setPaymentType('deposit')}
            className={`w-full flex items-center justify-between p-5 border-2 rounded-xl transition-all ${
              paymentType === 'deposit'
                ? 'border-primary-500 bg-primary-50 ring-2 ring-primary/20'
                : 'border-border hover:border-border hover:bg-background'
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  paymentType === 'deposit' ? 'border-primary bg-primary' : 'border-border'
                }`}
              >
                {paymentType === 'deposit' && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <div className="text-left">
                <div className="font-semibold text-foreground">50% Deposit</div>
                <div className="text-sm text-foreground0">
                  Pay ${depositAmount.toFixed(2)} now, rest before event
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-foreground">${depositAmount.toFixed(2)}</div>
              <div className="text-xs text-foreground0">+ ${depositAmount.toFixed(2)} later</div>
            </div>
          </button>
        </div>

        {/* Payment Summary */}
        <div className="rounded-xl bg-gradient-to-r from-primary-50 to-indigo-50 border border-primary/20 p-6">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-sm font-medium text-muted-foreground">Amount to Pay Now</span>
              <p className="text-xs text-foreground0 mt-1">
                {paymentType === 'deposit'
                  ? `Remaining $${depositAmount.toFixed(2)} due before event`
                  : 'No additional payment required'}
              </p>
            </div>
            <span className="text-3xl font-bold text-primary">${selectedAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Security Notice */}
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">Secure Payment</p>
              <p className="text-xs text-blue-700 mt-1">
                Your payment is processed securely through Stripe. We never store your card details.
              </p>
            </div>
          </div>
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
          onClick={initiatePayment}
          disabled={isLoading}
          className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Preparing...
            </>
          ) : (
            <>
              Continue to Payment
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
