'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/toast';

interface CloneButtonProps {
  bookingId: string;
}

function CloneButton({ bookingId }: CloneButtonProps) {
  const router = useRouter();
  const { success: showSuccess, error: showError } = useToast();
  const [isCloning, setIsCloning] = useState(false);

  const handleClone = async () => {
    setIsCloning(true);
    try {
      const response = await fetch(`/api/bookings/${bookingId}/clone`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to clone booking');
      }

      const data = await response.json();
      showSuccess('Booking cloned successfully!', 3000);
      router.push(`/bookings/${data.booking.id}`);
    } catch (error) {
      console.error('Clone error:', error);
      showError(error instanceof Error ? error.message : 'Failed to clone booking', 5000);
    } finally {
      setIsCloning(false);
    }
  };

  return (
    <button
      onClick={handleClone}
      disabled={isCloning}
      className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
    >
      {isCloning ? (
        <>
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Cloning...
        </>
      ) : (
        <>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Clone Booking
        </>
      )}
    </button>
  );
}

export default CloneButton;
