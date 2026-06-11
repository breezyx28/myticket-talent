import { Alert } from '@/components/ui/Alert';
import { useGetGovernmentIdVerificationQuery } from '@/api/endpoints';
import { AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function GovernmentIdReminderBanner({ profileRoute = true }: { profileRoute?: boolean }) {
  const { t } = useTranslation();
  const { data: submission, isLoading } = useGetGovernmentIdVerificationQuery();

  if (isLoading) return null;
  if (submission?.status === 'verified') return null;

  const href = profileRoute ? '/profile?tab=verification' : '/application?step=2';
  const message =
    submission?.status === 'pending'
      ? t('governmentId.bannerPending')
      : submission?.status === 'rejected'
        ? t('governmentId.bannerRejected')
        : t('governmentId.bannerMissing');

  const variant = submission?.status === 'rejected' ? 'error' : submission?.status === 'pending' ? 'info' : 'warning';

  return (
    <Alert
      variant={variant}
      icon={AlertCircle}
      actionHref={href}
      actionLabel={t('governmentId.bannerAction')}
    >
      {message}
    </Alert>
  );
}
