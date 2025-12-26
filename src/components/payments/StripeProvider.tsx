'use client';

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { ReactNode } from 'react';

// Load Stripe outside of component to avoid recreating on re-renders
const stripePromise = loadStripe(
  process.env['NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'] || ''
);

interface StripeProviderProps {
  children: ReactNode;
  clientSecret: string;
}

export function StripeProvider({ children, clientSecret }: StripeProviderProps) {
  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#6366f1',
            colorBackground: '#ffffff',
            colorText: '#1f2937',
            colorDanger: '#ef4444',
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            spacingUnit: '4px',
            borderRadius: '8px',
            fontSizeBase: '14px',
          },
          rules: {
            '.Input': {
              border: '1px solid #d1d5db',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            },
            '.Input:focus': {
              border: '1px solid #6366f1',
              boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.1)',
            },
            '.Label': {
              fontWeight: '500',
              marginBottom: '4px',
            },
            '.Tab': {
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            },
            '.Tab:hover': {
              border: '1px solid #6366f1',
            },
            '.Tab--selected': {
              backgroundColor: '#6366f1',
              borderColor: '#6366f1',
            },
          },
        },
      }}
    >
      {children}
    </Elements>
  );
}

