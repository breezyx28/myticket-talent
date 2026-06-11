import { Button } from '@/components/ui/Button';
import { Field } from '@/components/forms/Field';
import { TextArea } from '@/components/forms/TextArea';
import { TextInput } from '@/components/forms/TextInput';
import { ApplicationStatusBanner } from '@/components/talent/ApplicationStatusBanner';
import {
  useAddTalentMediaMutation,
  useCreateTalentApplicationMutation,
  useDeleteTalentMediaMutation,
  useGetMyRoleApplicationsQuery,
  useGetRoleApplicationQuery,
  useGetSaudiRegionsQuery,
  useSubmitTalentApplicationMutation,
  useSyncTalentApplicationCategoriesMutation,
  useUpdateTalentApplicationMutation,
} from '@/api/endpoints';
import { isTalentApplicationReady, TALENT_BIO_MAX_CHARS } from '@/lib/onboardingValidation';
import { readApiErrorMessage, readApiFieldErrors } from '@/lib/apiErrors';
import { resolveSubmitErrorStep } from '@/lib/applicationSubmitErrors';
import { hasMinimumCategories } from '@/lib/talentCategories';
import type { SyncTalentCategoryItem } from '@/api/types/talentCategory';
import {
  getTalentCityId,
  getTalentProfileImageUrl,
  getTalentRegionId,
} from '@/lib/talentApplicationFields';
import { uploadToCdn } from '@/lib/upload';
import {
  createTalentApplicationSchema,
  talentApplicationPatchSchema,
  type CreateTalentApplicationSchema,
  type TalentApplicationPatchSchema,
} from '@/schemas';
import type { TalentApplicationDetail } from '@/types/domain';
import { yupResolver } from '@hookform/resolvers/yup';
import { FileUploadButton } from '@/components/profile/FileUploadButton';
import { RegionCitySelect } from '@/components/profile/RegionCitySelect';
import { ReviewChecklist } from '@/components/application/ReviewChecklist';
import { GovernmentIdVerificationPanel } from '@/components/profile/GovernmentIdVerificationPanel';
import { TalentMediaGalleryEditor } from '@/components/profile/TalentMediaGalleryEditor';
import { TalentCategoryPicker } from '@/components/profile/TalentCategoryPicker';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

const STEPS = ['identity', 'profile', 'verification', 'review'] as const;

function WizardFooter({ children }: { children: ReactNode }) {
  return (
    <div
      className="sticky bottom-0 -mx-6 mt-8 flex flex-wrap gap-3 border-t border-ink-10 bg-white px-6 py-4 md:-mx-8 md:px-8"
      style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
    >
      {children}
    </div>
  );
}

export function ApplicationWizardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const stepIndex = Math.min(
    Math.max(Number(searchParams.get('step') ?? 0), 0),
    STEPS.length - 1,
  );

  const { data: myApps, isLoading: loadingApps } = useGetMyRoleApplicationsQuery();
  const applicationId = myApps?.talent?.id;
  const applicationStatus = myApps?.talent?.status;

  const { data: detail, refetch: refetchDetail } = useGetRoleApplicationQuery(
    { role: 'talent', id: applicationId! },
    { skip: applicationId == null },
  );

  const { data: regionsData } = useGetSaudiRegionsQuery();
  const regions = regionsData?.data ?? [];

  const [createApplication] = useCreateTalentApplicationMutation();
  const [updateApplication] = useUpdateTalentApplicationMutation();
  const [submitApplication, { isLoading: submitting }] = useSubmitTalentApplicationMutation();
  const [addMedia] = useAddTalentMediaMutation();
  const [deleteMedia] = useDeleteTalentMediaMutation();
  const [syncApplicationCategories] = useSyncTalentApplicationCategoriesMutation();

  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [uploading, setUploading] = useState(false);
  const [localAppId, setLocalAppId] = useState<string | number | null>(null);
  const [categoryPayload, setCategoryPayload] = useState<SyncTalentCategoryItem[]>([]);

  const effectiveId = applicationId ?? localAppId;

  const identityForm = useForm<CreateTalentApplicationSchema>({
    resolver: yupResolver(createTalentApplicationSchema) as never,
    defaultValues: { stage_name: '', contact_email: '', contact_phone: '' },
  });

  const profileForm = useForm<TalentApplicationPatchSchema>({
    resolver: yupResolver(talentApplicationPatchSchema) as never,
    defaultValues: {
      bio: '',
      saudi_region_id: undefined,
      city: undefined,
      travel_ready: false,
      location_public: false,
    },
  });

  const verificationForm = useForm<TalentApplicationPatchSchema>({
    resolver: yupResolver(talentApplicationPatchSchema) as never,
    defaultValues: {
      certificate_name: '',
      accepted_quality_disclaimer: false,
    },
  });

  useEffect(() => {
    const ta = detail?.talent_application;
    if (!ta) return;
    identityForm.reset({
      stage_name: ta.stage_name ?? '',
      contact_email: ta.contact_email ?? '',
      contact_phone: ta.contact_phone ?? '',
    });
    profileForm.reset({
      bio: ta.bio ?? '',
      saudi_region_id: getTalentRegionId(ta),
      city: getTalentCityId(ta),
      travel_ready: Boolean(ta.travel_ready),
      location_public: Boolean(ta.location_public),
    });
    verificationForm.reset({
      certificate_name: ta.certificate_name ?? '',
      accepted_quality_disclaimer: Boolean(ta.accepted_quality_disclaimer),
    });
  }, [detail, identityForm, profileForm, verificationForm]);

  const selectedRegionId = profileForm.watch('saudi_region_id');

  const goToStep = useCallback(
    (index: number) => {
      setSearchParams({ step: String(index) }, { replace: true });
    },
    [setSearchParams],
  );

  const persistPatch = useCallback(
    async (body: Record<string, unknown>) => {
      if (!effectiveId) return;
      setSaveState('saving');
      try {
        await updateApplication({ id: effectiveId, body }).unwrap();
        setSaveState('saved');
        void refetchDetail();
      } catch (err) {
        setSaveState('idle');
        toast.error(readApiErrorMessage(err, t('common.error')));
      }
    },
    [effectiveId, refetchDetail, t, updateApplication],
  );

  async function ensureApplication(values: CreateTalentApplicationSchema) {
    if (effectiveId) {
      await persistPatch(values);
      return effectiveId;
    }
    setSaveState('saving');
    try {
      const created = await createApplication({
        stage_name: values.stage_name,
        contact_email: values.contact_email,
        contact_phone: values.contact_phone || undefined,
      }).unwrap();
      setLocalAppId(created.id);
      setSaveState('saved');
      return created.id;
    } catch (err) {
      setSaveState('idle');
      toast.error(readApiErrorMessage(err, t('common.error')));
      return null;
    }
  }

  async function onIdentityNext() {
    const valid = await identityForm.trigger();
    if (!valid) return;
    const id = await ensureApplication(identityForm.getValues());
    if (id) goToStep(1);
  }

  async function onProfileNext() {
    const valid = await profileForm.trigger();
    if (!valid || !effectiveId) return;
    if (!hasMinimumCategories(categoryPayload.length)) {
      toast.error(t('categories.minRequired'));
      return;
    }
    await persistPatch(profileForm.getValues());
    try {
      await syncApplicationCategories({
        id: effectiveId,
        body: { categories: categoryPayload },
      }).unwrap();
      void refetchDetail();
      toast.success(t('common.saved'));
      goToStep(2);
    } catch (err) {
      toast.error(readApiErrorMessage(err, t('common.error')));
    }
  }

  async function onVerificationNext() {
    const valid = await verificationForm.trigger();
    if (!valid || !effectiveId) return;
    await persistPatch(verificationForm.getValues());
    goToStep(3);
  }

  async function onProfileImageUpload(file: File) {
    if (!effectiveId) return;
    setUploading(true);
    try {
      const { url } = await uploadToCdn(file);
      await updateApplication({ id: effectiveId, body: { profile_image: url } }).unwrap();
      void refetchDetail();
      toast.success(t('common.saved'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setUploading(false);
    }
  }

  async function onMediaUpload(file: File, kind: 'image' | 'video' | 'certificate') {
    if (!effectiveId) return;
    setUploading(true);
    try {
      const { url } = await uploadToCdn(file);
      await addMedia({
        id: effectiveId,
        body: { kind, value: url, position: detail?.talent_application?.media?.length ?? 0 },
      }).unwrap();
      void refetchDetail();
      toast.success(t('common.saved'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setUploading(false);
    }
  }

  async function onDeleteMedia(mediaId: string | number) {
    if (!effectiveId) return;
    try {
      await deleteMedia({ id: effectiveId, mediaId }).unwrap();
      void refetchDetail();
    } catch (err) {
      toast.error(readApiErrorMessage(err, t('common.error')));
    }
  }

  function applySubmitFieldErrors(err: unknown) {
    const fieldErrors = readApiFieldErrors(err);
    if (fieldErrors.stage_name?.[0]) {
      identityForm.setError('stage_name', { message: fieldErrors.stage_name[0] });
    }
    if (fieldErrors.contact_email?.[0]) {
      identityForm.setError('contact_email', { message: fieldErrors.contact_email[0] });
    }
    if (fieldErrors.contact_phone?.[0]) {
      identityForm.setError('contact_phone', { message: fieldErrors.contact_phone[0] });
    }
    if (fieldErrors.bio?.[0]) {
      profileForm.setError('bio', { message: fieldErrors.bio[0] });
    }
    if (fieldErrors.saudi_region_id?.[0]) {
      profileForm.setError('saudi_region_id', { message: fieldErrors.saudi_region_id[0] });
    }
    if (fieldErrors.city?.[0]) {
      profileForm.setError('city', { message: fieldErrors.city[0] });
    }
    if (fieldErrors.media?.[0]) {
      toast.error(fieldErrors.media[0]);
    }
    if (fieldErrors.accepted_quality_disclaimer?.[0]) {
      verificationForm.setError('accepted_quality_disclaimer', {
        message: fieldErrors.accepted_quality_disclaimer[0],
      });
    }
    if (fieldErrors.certificate_name?.[0]) {
      verificationForm.setError('certificate_name', { message: fieldErrors.certificate_name[0] });
    }
    goToStep(resolveSubmitErrorStep(fieldErrors));
  }

  async function onSubmit() {
    if (!effectiveId || !detail) return;
    const ready = isTalentApplicationReady(detail as TalentApplicationDetail);
    if (!ready) {
      toast.error(t('application.incomplete'));
      return;
    }
    try {
      await submitApplication({ id: effectiveId }).unwrap();
      navigate('/application/status', { replace: true });
    } catch (err) {
      applySubmitFieldErrors(err);
      toast.error(readApiErrorMessage(err, t('common.error')));
    }
  }

  if (loadingApps) {
    return <p className="text-[14px] text-ink-60">{t('common.loading')}</p>;
  }

  if (applicationStatus === 'submitted') {
    return <Navigate to="/application/status" replace />;
  }

  if (applicationStatus === 'approved') {
    return <Navigate to="/application/status" replace />;
  }

  const media = detail?.talent_application?.media ?? [];
  const profileImage = getTalentProfileImageUrl(detail?.talent_application);
  const readyForSubmit = detail ? isTalentApplicationReady(detail as TalentApplicationDetail) : false;

  return (
    <div className="space-y-6">
      {applicationStatus && applicationStatus !== 'draft' && applicationStatus !== 'not_started' ? (
        <ApplicationStatusBanner status={applicationStatus} />
      ) : null}

      <div>
        <div className="mb-6 flex items-center justify-end gap-3">
          <span className="text-[12px] font-medium text-ink-40">
            {saveState === 'saving'
              ? t('common.saving')
              : saveState === 'saved'
                ? t('common.saved')
                : null}
          </span>
        </div>

        {stepIndex === 0 ? (
          <form className="mt-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
            <Field label={t('application.stageName')} error={identityForm.formState.errors.stage_name?.message}>
              <TextInput {...identityForm.register('stage_name')} hasError={Boolean(identityForm.formState.errors.stage_name)} />
            </Field>
            <Field label={t('application.contactEmail')} error={identityForm.formState.errors.contact_email?.message}>
              <TextInput
                {...identityForm.register('contact_email')}
                type="email"
                dir="ltr"
                hasError={Boolean(identityForm.formState.errors.contact_email)}
              />
            </Field>
            <Field label={t('application.contactPhone')} error={identityForm.formState.errors.contact_phone?.message}>
              <TextInput
                {...identityForm.register('contact_phone')}
                dir="ltr"
                hasError={Boolean(identityForm.formState.errors.contact_phone)}
              />
            </Field>
            <Field label={t('profile.headshot')}>
              <div className="flex flex-wrap items-center gap-3">
                {profileImage ? (
                  <img src={profileImage} alt="" className="h-20 w-20 rounded-2xl object-cover ring-2 ring-ink-10" />
                ) : null}
                <FileUploadButton
                  label={t('profile.uploadHeadshot')}
                  accept="image/*"
                  loading={uploading}
                  disabled={!effectiveId}
                  onFile={(file) => void onProfileImageUpload(file)}
                />
              </div>
            </Field>
            <WizardFooter>
              <Button type="button" variant="primary" onClick={() => void onIdentityNext()}>
                {t('common.continue')}
              </Button>
            </WizardFooter>
          </form>
        ) : null}

        {stepIndex === 1 ? (
          <form className="mt-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
            <Field label={t('application.bio')} error={profileForm.formState.errors.bio?.message}>
              <TextArea
                {...profileForm.register('bio')}
                rows={5}
                maxLength={TALENT_BIO_MAX_CHARS}
                hasError={Boolean(profileForm.formState.errors.bio)}
              />
            </Field>
            <RegionCitySelect
              regions={regions}
              register={profileForm.register}
              setValue={profileForm.setValue}
              selectedRegionId={selectedRegionId ?? undefined}
              errors={profileForm.formState.errors}
            />
            <label className="flex items-center gap-2 text-[14px] font-medium text-ink">
              <input type="checkbox" {...profileForm.register('travel_ready')} className="rounded border-ink-20" />
              {t('application.travelReady')}
            </label>
            <label className="flex items-center gap-2 text-[14px] font-medium text-ink">
              <input type="checkbox" {...profileForm.register('location_public')} className="rounded border-ink-20" />
              {t('application.locationPublic')}
            </label>
            <div className="rounded-2xl border border-ink-10 bg-surface-muted p-4">
              <TalentCategoryPicker
                mode="application"
                applicationId={effectiveId ?? undefined}
                applicationStatus={applicationStatus}
                initialCategories={detail?.talent_application?.categories}
                onSelectionChange={setCategoryPayload}
              />
            </div>
            <WizardFooter>
              <Button type="button" variant="outline" onClick={() => goToStep(0)}>
                {t('common.back')}
              </Button>
              <Button type="button" variant="primary" onClick={() => void onProfileNext()}>
                {t('common.continue')}
              </Button>
            </WizardFooter>
          </form>
        ) : null}

        {stepIndex === 2 ? (
          <div className="mt-6 space-y-6">
            <GovernmentIdVerificationPanel />
            <div className="border-t border-ink-10 pt-6">
              <h3 className="text-[15px] font-bold text-ink">{t('profile.verificationFiles')}</h3>
              <p className="mt-1 text-[13px] text-ink-60">{t('profile.verificationFilesHint')}</p>
            </div>
            <Field label={t('profile.certificateName')}>
              <TextInput {...verificationForm.register('certificate_name')} />
            </Field>
            <div className="rounded-2xl border border-ink-10 bg-ink-5/40 p-4">
              <p className="text-[12px] font-semibold text-ink-60">{t('profile.mediaGallery')}</p>
              <div className="mt-3">
                <TalentMediaGalleryEditor
                  applicationMedia={media}
                  profileGallery={[]}
                  canEdit
                  uploading={uploading}
                  onUpload={(file, kind) => void onMediaUpload(file, kind)}
                  onDelete={(id) => void onDeleteMedia(id)}
                />
              </div>
            </div>
            <label className="flex items-start gap-2 text-[14px] font-medium text-ink">
              <input
                type="checkbox"
                {...verificationForm.register('accepted_quality_disclaimer')}
                className="mt-1 rounded border-ink-20"
              />
              {t('application.qualityDisclaimer')}
            </label>
            {verificationForm.formState.errors.accepted_quality_disclaimer ? (
              <p className="text-[12px] font-medium text-coral">
                {verificationForm.formState.errors.accepted_quality_disclaimer.message}
              </p>
            ) : null}
            <WizardFooter>
              <Button type="button" variant="outline" onClick={() => goToStep(1)}>
                {t('common.back')}
              </Button>
              <Button type="button" variant="primary" onClick={() => void onVerificationNext()}>
                {t('common.continue')}
              </Button>
            </WizardFooter>
          </div>
        ) : null}

        {stepIndex === 3 ? (
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-ink-10 bg-surface-muted p-4 text-[14px] text-ink-60">
              <p>
                <strong className="text-ink">{identityForm.getValues('stage_name')}</strong> ·{' '}
                {identityForm.getValues('contact_email')}
              </p>
              <p className="mt-2 line-clamp-3">{profileForm.getValues('bio')}</p>
              <p className="mt-2 text-[12px]">
                {t('application.mediaCount', { count: media.length })} ·{' '}
                {t('categories.selectedCount', {
                  count: detail?.talent_application?.categories?.length ?? 0,
                })}{' '}
                ·{' '}
                {verificationForm.getValues('accepted_quality_disclaimer')
                  ? t('application.disclaimerAccepted')
                  : t('application.disclaimerMissing')}
              </p>
            </div>
            {detail ? <ReviewChecklist detail={detail as TalentApplicationDetail} /> : null}
            {!readyForSubmit ? (
              <p className="rounded-xl border border-coral/30 bg-coral/10 px-4 py-3 text-[13px] font-medium text-coral">
                {t('application.incomplete')}
              </p>
            ) : null}
            <WizardFooter>
              <Button type="button" variant="outline" onClick={() => goToStep(2)}>
                {t('common.back')}
              </Button>
              <Button
                type="button"
                variant="primary"
                loading={submitting}
                disabled={!readyForSubmit}
                onClick={() => void onSubmit()}
              >
                {t('application.submit')}
              </Button>
            </WizardFooter>
          </div>
        ) : null}
      </div>
    </div>
  );
}
