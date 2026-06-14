import { FileUploadButton } from '@/components/profile/FileUploadButton';
import { TalentMediaGalleryEditor } from '@/components/profile/TalentMediaGalleryEditor';
import { useGetMeQuery } from '@/api/endpoints';
import { useTalentProfileUploads } from '@/hooks/useTalentProfileUploads';
import type { RoleApplicationDetail } from '@/api/types/roleApplication';
import type { TalentProfileMe } from '@/api/types/user';
import { getTalentLiveProfileImageUrl, getTalentProfileImageUrl } from '@/lib/talentApplicationFields';
import { useTranslation } from 'react-i18next';

export function ProfilePortfolioSection({
  profile,
  applicationDetail,
}: {
  profile: TalentProfileMe;
  applicationDetail?: RoleApplicationDetail | null;
}) {
  const { t } = useTranslation();
  const { data: me } = useGetMeQuery();
  const application = applicationDetail?.talent_application;
  const media = application?.media ?? [];
  const profileImage =
    getTalentLiveProfileImageUrl(profile) ??
    getTalentLiveProfileImageUrl(me) ??
    getTalentProfileImageUrl(application ?? undefined);

  const { uploading, canEditApplication, uploadProfileImage, uploadMedia, removeMedia } =
    useTalentProfileUploads({
      applicationId: applicationDetail?.id,
      applicationStatus: applicationDetail?.status,
      mediaCount: media.length,
    });

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-ink-10 bg-white p-6 shadow-card-sm">
        <h2 className="text-[16px] font-bold text-ink">{t('profile.headshot')}</h2>
        <p className="mt-1 text-[13px] text-ink-60">{t('profile.headshotHint')}</p>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          {profileImage ? (
            <img
              src={profileImage}
              alt=""
              className="h-28 w-28 rounded-3xl object-cover ring-2 ring-ink-10"
            />
          ) : (
            <div className="flex h-28 w-28 items-center justify-center rounded-3xl bg-ink-5 text-ink-40">—</div>
          )}
          <FileUploadButton
            label={t('profile.uploadHeadshot')}
            accept="image/jpeg,image/png,image/gif,image/webp"
            loading={uploading}
            onFile={(file) => void uploadProfileImage(file)}
          />
        </div>
        {!canEditApplication ? (
          <p className="mt-3 text-[12px] text-ink-40">{t('profile.portfolioApiNote')}</p>
        ) : null}
      </section>

      <section className="rounded-3xl border border-ink-10 bg-white p-6 shadow-card-sm">
        <h2 className="text-[16px] font-bold text-ink">{t('profile.mediaGallery')}</h2>
        <p className="mt-1 text-[13px] text-ink-60">{t('profile.mediaGalleryHint')}</p>
        <div className="mt-4">
          <TalentMediaGalleryEditor
            applicationMedia={media}
            profileGallery={profile.gallery ?? []}
            canEdit={Boolean(applicationDetail?.id)}
            uploading={uploading}
            onUpload={(file, kind) => void uploadMedia(file, kind)}
            onDelete={canEditApplication ? (id) => void removeMedia(id) : undefined}
          />
        </div>
      </section>

      {profile.intro_video_url ? (
        <section className="rounded-3xl border border-ink-10 bg-white p-6 shadow-card-sm">
          <h2 className="text-[16px] font-bold text-ink">{t('profile.introVideo')}</h2>
          <a
            href={profile.intro_video_url}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-block text-[13px] font-semibold text-coral hover:underline"
            dir="ltr"
          >
            {profile.intro_video_url}
          </a>
        </section>
      ) : null}
    </div>
  );
}
