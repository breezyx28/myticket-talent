import { ProfileTabs, type ProfileTab } from '@/components/profile/ProfileTabs';
import { PageSkeleton } from '@/components/ui/PageSkeleton';
import {
  useGetMyRoleApplicationsQuery,
  useGetRoleApplicationQuery,
  useGetTalentProfileQuery,
} from '@/api/endpoints';
import { ProfileBasicSection } from '@/pages/profile/sections/ProfileBasicSection';
import { ProfileLocationSection } from '@/pages/profile/sections/ProfileLocationSection';
import { ProfilePortfolioSection } from '@/pages/profile/sections/ProfilePortfolioSection';
import { ProfileSettingsSection } from '@/pages/profile/sections/ProfileSettingsSection';
import { ProfileVerificationSection } from '@/pages/profile/sections/ProfileVerificationSection';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

function parseTab(value: string | null): ProfileTab {
  if (value === 'location' || value === 'portfolio' || value === 'verification' || value === 'settings') {
    return value;
  }
  return 'basic';
}

export function ProfilePage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = parseTab(searchParams.get('tab'));

  const { data: profile, isLoading: loadingProfile } = useGetTalentProfileQuery();
  const { data: myApps } = useGetMyRoleApplicationsQuery();
  const applicationId = myApps?.talent?.id;
  const { data: applicationDetail, isLoading: loadingApplication } = useGetRoleApplicationQuery(
    { role: 'talent', id: applicationId! },
    { skip: applicationId == null },
  );

  function setTab(tab: ProfileTab) {
    setSearchParams(tab === 'basic' ? {} : { tab }, { replace: true });
  }

  if (loadingProfile || (applicationId != null && loadingApplication)) {
    return <PageSkeleton label={t('common.loading')} />;
  }

  if (!profile) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] font-extrabold text-ink">{t('profile.title')}</h1>
        <p className="mt-1 text-[14px] text-ink-60">{t('profile.subtitle')}</p>
      </div>

      <ProfileTabs active={activeTab} onChange={setTab} />

      {activeTab === 'basic' ? (
        <ProfileBasicSection profile={profile} application={applicationDetail?.talent_application} />
      ) : null}
      {activeTab === 'location' ? (
        <ProfileLocationSection profile={profile} applicationDetail={applicationDetail} />
      ) : null}
      {activeTab === 'portfolio' ? (
        <ProfilePortfolioSection profile={profile} applicationDetail={applicationDetail} />
      ) : null}
      {activeTab === 'verification' ? (
        <ProfileVerificationSection profile={profile} applicationDetail={applicationDetail} />
      ) : null}
      {activeTab === 'settings' ? <ProfileSettingsSection /> : null}
    </div>
  );
}
