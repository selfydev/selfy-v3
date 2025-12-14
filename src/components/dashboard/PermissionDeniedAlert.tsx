'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';

export function PermissionDeniedAlert() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { error: showError } = useToast();
  const hasShownError = useRef(false);

  useEffect(() => {
    const error = searchParams.get('error');
    const required = searchParams.get('required');

    if (error === 'insufficient_permissions' && !hasShownError.current) {
      hasShownError.current = true;
      showError(`Access denied. This page requires ${required || 'higher'} role.`, 5000);

      // Clean up URL without the error params
      const newUrl = window.location.pathname;
      router.replace(newUrl);
    }
  }, [searchParams, showError, router]);

  return null;
}
