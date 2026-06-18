import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/** Re-run validation when UI language changes so Yup messages match the active locale. */
export function useRevalidateFormOnLanguageChange(trigger: () => Promise<boolean>) {
  const { i18n } = useTranslation();

  useEffect(() => {
    const handler = () => {
      void trigger();
    };
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n, trigger]);
}
