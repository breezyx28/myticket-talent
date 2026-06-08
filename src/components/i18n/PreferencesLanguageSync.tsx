import { useGetPreferencesQuery } from '@/api/endpoints';
import { getToken } from '@/api/authToken';
import i18n, { type AppLanguage } from '@/i18n';
import { useEffect } from 'react';

function isAppLanguage(value: string | undefined | null): value is AppLanguage {
  return value === 'en' || value === 'ar';
}

export function PreferencesLanguageSync() {
  const hasToken = Boolean(getToken());
  const { data: preferences } = useGetPreferencesQuery(undefined, { skip: !hasToken });

  useEffect(() => {
    const next = preferences?.language;
    if (!isAppLanguage(next) || i18n.language === next) return;
    void i18n.changeLanguage(next);
  }, [preferences?.language]);

  return null;
}
