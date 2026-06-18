import { Toaster as SonnerToaster } from 'sonner';
import { isRtlLanguage } from '@/lib/language-core';
import { useTranslation } from 'react-i18next';

export function AppToaster() {
  const { i18n } = useTranslation();
  const position = isRtlLanguage(i18n.language) ? 'top-left' : 'top-right';

  return (
    <SonnerToaster
      key={position}
      position={position}
      richColors
      closeButton
      duration={4000}
      offset={{ top: '5.5rem' }}
      toastOptions={{
        classNames: {
          toast: 'rounded-xl border border-ink-10 shadow-card-sm font-sans',
          title: 'text-[13px] font-semibold',
          description: 'text-[12px] text-ink-60',
        },
      }}
    />
  );
}
