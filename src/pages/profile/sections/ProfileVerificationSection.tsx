import { Button } from '@/components/ui/Button';
import { Field } from '@/components/forms/Field';
import { TextInput } from '@/components/forms/TextInput';
import { GovernmentIdVerificationPanel } from '@/components/profile/GovernmentIdVerificationPanel';
import { TalentMediaGalleryEditor } from '@/components/profile/TalentMediaGalleryEditor';
import { useTalentProfileUploads } from '@/hooks/useTalentProfileUploads';
import {
  useGetGovernmentIdVerificationQuery,
  useUpdateTalentApplicationMutation,
} from '@/api/endpoints';
import { readApiErrorMessage } from '@/lib/apiErrors';
import { canEditTalentApplication } from '@/lib/roleApplicationEdit';
import type { RoleApplicationDetail } from '@/api/types/roleApplication';
import type { TalentProfileMe } from '@/api/types/user';
import { talentApplicationPatchSchema, type TalentApplicationPatchSchema } from '@/schemas';
import { yupResolver } from '@hookform/resolvers/yup';
import { CheckCircle2, XCircle } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

export function ProfileVerificationSection({
  applicationDetail,
}: {
  profile: TalentProfileMe;
  applicationDetail?: RoleApplicationDetail | null;
}) {
  const { t } = useTranslation();
  const application = applicationDetail?.talent_application;
  const media = application?.media ?? [];
  const canEdit = canEditTalentApplication(applicationDetail?.status);
  const { data: governmentId } = useGetGovernmentIdVerificationQuery();
  const [updateApplication, { isLoading }] = useUpdateTalentApplicationMutation();

  const { uploading, uploadMedia, removeMedia } = useTalentProfileUploads({
    applicationId: applicationDetail?.id,
    applicationStatus: applicationDetail?.status,
    mediaCount: media.length,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TalentApplicationPatchSchema>({
    resolver: yupResolver(talentApplicationPatchSchema) as never,
    defaultValues: { certificate_name: '', accepted_quality_disclaimer: false },
  });

  useEffect(() => {
    reset({
      certificate_name: application?.certificate_name ?? '',
      accepted_quality_disclaimer: Boolean(application?.accepted_quality_disclaimer),
    });
  }, [application, reset]);

  async function onSubmit(values: TalentApplicationPatchSchema) {
    if (!applicationDetail?.id || !canEdit) return;
    try {
      await updateApplication({
        id: applicationDetail.id,
        body: {
          certificate_name: values.certificate_name ?? undefined,
          accepted_quality_disclaimer: values.accepted_quality_disclaimer ?? undefined,
        },
      }).unwrap();
      toast.success(t('common.saved'));
    } catch (err) {
      toast.error(readApiErrorMessage(err, t('common.error')));
    }
  }

  const disclaimerAccepted = Boolean(application?.accepted_quality_disclaimer);
  const govStatus = governmentId?.status ?? application?.government_id_status ?? null;

  return (
    <div className="space-y-6">
      <GovernmentIdVerificationPanel />

      <section className="rounded-3xl border border-ink-10 bg-white p-6 shadow-card-sm">
        <h2 className="text-[16px] font-bold text-ink">{t('profile.verificationStatus')}</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-mint/15 px-3 py-1.5 text-[13px] font-semibold text-mint-dark">
            <CheckCircle2 size={16} />
            {t('profile.applicationApproved')}
          </span>
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[13px] font-semibold ${
              disclaimerAccepted ? 'bg-mint/15 text-mint-dark' : 'bg-coral/10 text-coral'
            }`}
          >
            {disclaimerAccepted ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
            {disclaimerAccepted ? t('profile.disclaimerAccepted') : t('profile.disclaimerMissing')}
          </span>
          {govStatus === 'verified' ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-mint/15 px-3 py-1.5 text-[13px] font-semibold text-mint-dark">
              <CheckCircle2 size={16} />
              {t('governmentId.status_verified')}
            </span>
          ) : govStatus === 'pending' ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-sky/15 px-3 py-1.5 text-[13px] font-semibold text-sky-dark">
              {t('governmentId.status_pending')}
            </span>
          ) : govStatus === 'rejected' ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-coral/10 px-3 py-1.5 text-[13px] font-semibold text-coral">
              <XCircle size={16} />
              {t('governmentId.status_rejected')}
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 rounded-full bg-ink-5 px-3 py-1.5 text-[13px] font-semibold text-ink-60">
              {t('governmentId.status_not_submitted')}
            </span>
          )}
        </div>
      </section>

      {canEdit ? (
        <form
          className="space-y-4 rounded-3xl border border-ink-10 bg-white p-6 shadow-card-sm"
          onSubmit={handleSubmit(onSubmit)}
        >
          <Field label={t('profile.certificateName')} error={errors.certificate_name?.message}>
            <TextInput {...register('certificate_name')} hasError={Boolean(errors.certificate_name)} />
          </Field>
          <label className="flex items-start gap-2 text-[14px] font-medium text-ink">
            <input
              type="checkbox"
              {...register('accepted_quality_disclaimer')}
              className="mt-1 rounded border-ink-20"
            />
            {t('application.qualityDisclaimer')}
          </label>
          {errors.accepted_quality_disclaimer ? (
            <p className="text-[12px] font-medium text-coral">{errors.accepted_quality_disclaimer.message}</p>
          ) : null}
          <Button type="submit" variant="dark" loading={isLoading}>
            {t('profile.saveChanges')}
          </Button>
        </form>
      ) : (
        <section className="rounded-3xl border border-ink-10 bg-white p-6 shadow-card-sm">
          <Field label={t('profile.certificateName')}>
            <TextInput value={application?.certificate_name ?? '—'} readOnly disabled className="bg-ink-5/50" />
          </Field>
          <p className="mt-3 text-[12px] text-ink-40">{t('profile.verificationLocked')}</p>
        </section>
      )}

      <section className="rounded-3xl border border-ink-10 bg-white p-6 shadow-card-sm">
        <h2 className="text-[16px] font-bold text-ink">{t('profile.verificationFiles')}</h2>
        <p className="mt-1 text-[13px] text-ink-60">{t('profile.verificationFilesHint')}</p>
        <div className="mt-4">
          <TalentMediaGalleryEditor
            applicationMedia={media.filter((m) => m.kind === 'certificate' || m.kind === 'image' || m.kind === 'video')}
            profileGallery={[]}
            canEdit={canEdit}
            uploading={uploading}
            onUpload={(file, kind) => void uploadMedia(file, kind)}
            onDelete={canEdit ? (id) => void removeMedia(id) : undefined}
          />
        </div>
      </section>
    </div>
  );
}
