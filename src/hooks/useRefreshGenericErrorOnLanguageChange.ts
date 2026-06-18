import { useEffect, type MutableRefObject } from 'react';
import { useTranslation } from 'react-i18next';

/** Re-apply a translated fallback when language changes (e.g. client-side validation copy). */
export function useRefreshGenericErrorOnLanguageChange(
  error: string | null,
  setError: (message: string | null) => void,
  isGenericRef: MutableRefObject<boolean>,
  messageKey: string,
) {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const handler = () => {
      if (!error || !isGenericRef.current) return;
      setError(t(messageKey));
    };
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [error, i18n, isGenericRef, messageKey, setError, t]);
}
