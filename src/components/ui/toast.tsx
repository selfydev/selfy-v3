'use client';

import { toast as sonnerToast } from 'sonner';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

// Hook that provides same API but uses sonner
export function useToast(): ToastContextType {
  return {
    success: (message: string, duration?: number) => {
      sonnerToast.success(message, { duration: duration || 5000 });
    },
    error: (message: string, duration?: number) => {
      sonnerToast.error(message, { duration: duration || 5000 });
    },
    warning: (message: string, duration?: number) => {
      sonnerToast.warning(message, { duration: duration || 5000 });
    },
    info: (message: string, duration?: number) => {
      sonnerToast.info(message, { duration: duration || 5000 });
    },
  };
}

// No-op provider for backward compatibility
export function ToastProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export default ToastProvider;
