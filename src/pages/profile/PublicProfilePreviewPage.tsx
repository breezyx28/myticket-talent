import { AvailabilityToggle } from '@/components/talent/AvailabilityToggle';
import { TalentCategoryBadges } from '@/components/profile/TalentCategoryBadges';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageSkeletonBlocks } from '@/components/ui/Skeleton';
import {
  useGetMyRoleApplicationsQuery,
  useGetRoleApplicationQuery,
  useGetTalentProfileQuery,
} from '@/api/endpoints';
import { ENV } from '@/config/env';
import {
  getTalentContactEmail,
  getTalentContactPhone,
  getTalentLiveProfileImageUrl,
  getTalentStageName,
} from '@/lib/talentApplicationFields';
import { ExternalLink, Mail, Phone, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function PublicProfilePreviewPage() {
  const { t } = useTranslation();
  const { data: profile, isLoading: loadingProfile } = useGetTalentProfileQuery();
  const { data: myApps, isLoading: loadingApps } = useGetMyRoleApplicationsQuery();
  const applicationId = myApps?.talent?.id;
  const { data: applicationDetail, isLoading: loadingApplication } = useGetRoleApplicationQuery(
    { role: 'talent', id: applicationId! },
    { skip: applicationId == null },
  );

  if (loadingProfile || loadingApps || (applicationId != null && loadingApplication)) {
    return <PageSkeletonBlocks />;
  }

  if (!profile) return null;

  const application = applicationDetail?.talent_application;
  const publicUrl = `${ENV.mainWebsiteUrl}/artists/${profile.slug}`;
  const profileImage = getTalentLiveProfileImageUrl(profile);
  const stageName = getTalentStageName(profile, application);
  const contactEmail = getTalentContactEmail(application);
  const contactPhone = getTalentContactPhone(application);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('nav.preview')}
        description={t('profile.publicSlug')}
        actions={
          <a href={publicUrl} target="_blank" rel="noreferrer">
            <Button variant="primary">
              <ExternalLink size={16} />
              {t('profile.viewPublicProfile')}
            </Button>
          </a>
        }
      />

      <article className="overflow-hidden rounded-2xl border border-ink-10 bg-white shadow-card-md">
        <div className="grid gap-0 md:grid-cols-[240px_1fr]">
          {profileImage ? (
            <img src={profileImage} alt="" className="h-full min-h-[240px] w-full object-cover" />
          ) : (
            <div className="min-h-[240px] bg-gradient-to-br from-lemon/40 to-coral/20" />
          )}
          <div className="p-6 md:p-8">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-extrabold text-ink">
                {stageName || t('profile.stageNameUnset')}
              </h2>
              <AvailabilityToggle status={profile.availability_status} readOnly />
            </div>

            {(contactEmail || contactPhone) ? (
              <dl className="mt-4 space-y-2 rounded-xl border border-ink-10 bg-surface-muted px-4 py-3">
                {contactEmail ? (
                  <div className="flex items-center gap-2 text-[14px] text-ink">
                    <Mail size={15} className="shrink-0 text-ink-40" />
                    <dt className="sr-only">{t('application.contactEmail')}</dt>
                    <dd dir="ltr">{contactEmail}</dd>
                  </div>
                ) : null}
                {contactPhone ? (
                  <div className="flex items-center gap-2 text-[14px] text-ink">
                    <Phone size={15} className="shrink-0 text-ink-40" />
                    <dt className="sr-only">{t('application.contactPhone')}</dt>
                    <dd dir="ltr">{contactPhone}</dd>
                  </div>
                ) : null}
              </dl>
            ) : null}

            <div className="mt-3 flex items-center gap-2 text-[14px] font-semibold text-ink" dir="ltr">
              <Star size={16} className="fill-coral text-coral" />
              {profile.rating_average} · {t('ratings.count', { count: profile.rating_count })}
            </div>
            {profile.bio ? (
              <p className="mt-4 text-[14px] leading-relaxed text-ink-60">{profile.bio}</p>
            ) : null}
            {(profile.website_url || profile.instagram_handle) ? (
              <div className="mt-4 flex flex-wrap gap-3 text-[13px] font-medium text-coral">
                {profile.website_url ? (
                  <a href={profile.website_url} target="_blank" rel="noreferrer" dir="ltr" className="hover:underline">
                    {profile.website_url}
                  </a>
                ) : null}
                {profile.instagram_handle ? (
                  <span dir="ltr">@{profile.instagram_handle.replace(/^@/, '')}</span>
                ) : null}
              </div>
            ) : null}
            <TalentCategoryBadges
              categories={profile.categories}
              className="mt-4"
              emptyLabel={t('categories.empty')}
            />
          </div>
        </div>
        {profile.gallery && profile.gallery.length > 0 ? (
          <div className="grid grid-cols-2 gap-2 border-t border-ink-10 p-4 sm:grid-cols-4">
            {profile.gallery.map((item) => (
              <img
                key={item.id}
                src={item.image_url}
                alt={item.caption ?? ''}
                className="aspect-square rounded-2xl object-cover"
              />
            ))}
          </div>
        ) : null}
      </article>
    </div>
  );
}
