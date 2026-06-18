import { useGetPreferencesQuery } from '@/api/endpoints';
import { getToken } from '@/api/authToken';
import type { AppLanguage } from '@/i18n';
import { applyAppLanguage } from '@/lib/language';
import { useEffect } from 'react';

function isAppLanguage(value: string | undefined | null): value is AppLanguage {
  return value === 'en' || value === 'ar';
}

export function PreferencesLanguageSync() {
  const hasToken = Boolean(getToken());
  const { data: preferences } = useGetPreferencesQuery(undefined, { skip: !hasToken });

  useEffect(() => {
    const next = preferences?.language;
    if (!isAppLanguage(next)) return;
    void applyAppLanguage(next);
  }, [preferences?.language]);

  return null;
}
