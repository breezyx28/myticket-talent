import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileSubNav, type ProfileTab } from '@/components/profile/ProfileSubNav';
import { PageSkeletonBlocks } from '@/components/ui/Skeleton';
import {
  useGetGovernmentIdVerificationQuery,
  useGetMyRoleApplicationsQuery,
  useGetRoleApplicationQuery,
  useGetTalentProfileQuery,
} from '@/api/endpoints';
import { ProfileBasicSection } from '@/pages/profile/sections/ProfileBasicSection';
import { ProfileLocationSection } from '@/pages/profile/sections/ProfileLocationSection';
import { ProfilePortfolioSection } from '@/pages/profile/sections/ProfilePortfolioSection';
import { ProfileSettingsSection } from '@/pages/profile/sections/ProfileSettingsSection';
import { ProfileVerificationSection } from '@/pages/profile/sections/ProfileVerificationSection';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

function parseTab(value: string | null): ProfileTab | null {
  if (value === 'location' || value === 'portfolio' || value === 'verification' || value === 'settings') {
    return value;
  }
  if (value === 'basic') return 'basic';
  return null;
}

export function ProfilePage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const { data: profile, isLoading: loadingProfile } = useGetTalentProfileQuery();
  const { data: govId, isLoading: loadingGovId } = useGetGovernmentIdVerificationQuery();
  const { data: myApps } = useGetMyRoleApplicationsQuery();
  const applicationId = myApps?.talent?.id;
  const { data: applicationDetail, isLoading: loadingApplication } = useGetRoleApplicationQuery(
    { role: 'talent', id: applicationId! },
    { skip: applicationId == null },
  );

  const tabFromUrl = parseTab(searchParams.get('tab'));
  const needsVerification = govId?.status !== 'verified' && govId?.status !== 'pending';
  const defaultTab: ProfileTab = needsVerification ? 'verification' : 'basic';
  const activeTab = tabFromUrl ?? defaultTab;

  function setTab(tab: ProfileTab) {
    setSearchParams(tab === 'basic' ? {} : { tab }, { replace: true });
  }

  useEffect(() => {
    if (activeTab !== 'verification') return;
    const timer = window.setTimeout(() => {
      document.getElementById('government-id-verification')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
    return () => window.clearTimeout(timer);
  }, [activeTab]);

  if (loadingProfile || loadingGovId || (applicationId != null && loadingApplication)) {
    return <PageSkeletonBlocks />;
  }

  if (!profile) return null;

  const disclaimerAccepted = Boolean(applicationDetail?.talent_application?.accepted_quality_disclaimer);

  return (
    <div className="space-y-6">
      <ProfileHeader
        profile={profile}
        govIdVerified={govId?.status === 'verified'}
        disclaimerAccepted={disclaimerAccepted}
        categoriesComplete={(profile.categories?.length ?? 0) > 0}
      />

      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <ProfileSubNav active={activeTab} onChange={setTab} />

        <div className="min-w-0">
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
      </div>
    </div>
  );
}
