import { useGetTalentProfileQuery } from '@/api/endpoints';
import { useTranslation } from 'react-i18next';
import { Navigate, Outlet } from 'react-router-dom';

export function RequireApprovedTalent() {
  const { data: profile, isLoading, isError } = useGetTalentProfileQuery();
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-surface-tint text-[14px] font-medium text-ink-60">
        {t('common.loading')}
      </div>
    );
  }

  if (isError || !profile) {
    return <Navigate to="/application" replace />;
  }

  return <Outlet />;
}
