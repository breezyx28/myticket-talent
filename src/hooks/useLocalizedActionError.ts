import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ValidationError } from 'yup';

type RevalidateFn = () => Promise<string | null>;

/** Action error that re-translates Yup validation messages when the UI language changes. */
export function useLocalizedActionError() {
  const { i18n } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const sourceRef = useRef<'api' | 'validation' | null>(null);
  const revalidateRef = useRef<RevalidateFn | null>(null);

  const clearError = useCallback(() => {
    sourceRef.current = null;
    revalidateRef.current = null;
    setError(null);
  }, []);

  const setApiError = useCallback((message: string) => {
    sourceRef.current = 'api';
    revalidateRef.current = null;
    setError(message);
  }, []);

  const setValidationError = useCallback((message: string, revalidate: RevalidateFn) => {
    sourceRef.current = 'validation';
    revalidateRef.current = revalidate;
    setError(message);
  }, []);

  useEffect(() => {
    const handler = () => {
      if (sourceRef.current !== 'validation' || !revalidateRef.current) return;
      void revalidateRef.current().then((message) => {
        if (message) setError(message);
      });
    };
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);

  return { error, clearError, setApiError, setValidationError };
}

export function isValidationError(err: unknown): err is ValidationError {
  return err instanceof ValidationError;
}
