import { useGetTalentProfileQuery } from '@/api/endpoints';
import { PageSkeleton } from '@/components/ui/PageSkeleton';
import { useTranslation } from 'react-i18next';
import { Navigate, Outlet } from 'react-router-dom';

export function RequireApprovedTalent() {
  const { data: profile, isLoading, isFetching } = useGetTalentProfileQuery();
  const { t } = useTranslation();

  if (isLoading || (isFetching && !profile)) {
    return <PageSkeleton label={t('common.loading')} />;
  }

  if (!profile) {
    return <Navigate to="/application/status" replace />;
  }

  return <Outlet />;
}
