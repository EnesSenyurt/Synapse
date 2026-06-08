import { useState, useCallback } from 'react';
import { createToast, type ToastMessage } from '../components/Toast';

export function useToasts() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((type: ToastMessage['type'], message: string) => {
    setToasts((prev) => [...prev, createToast(type, message)]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
}

export type AddToast = ReturnType<typeof useToasts>['addToast'];
