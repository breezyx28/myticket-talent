import { Button } from '@/components/ui/Button';
import { Field } from '@/components/forms/Field';
import { Select } from '@/components/forms/Select';
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
  useUpdateTalentApplicationMutation,
} from '@/api/endpoints';
import { isTalentApplicationReady, TALENT_BIO_MAX_CHARS } from '@/lib/onboardingValidation';
import { readApiErrorMessage, readApiFieldErrors } from '@/lib/apiErrors';
import { resolveSubmitErrorStep } from '@/lib/applicationSubmitErrors';
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
import { Loader2, Trash2, Upload } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

const STEPS = ['identity', 'profile', 'verification', 'review'] as const;

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

  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [uploading, setUploading] = useState(false);
  const [localAppId, setLocalAppId] = useState<string | number | null>(null);

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
  const cities = useMemo(() => {
    const region = regions.find((r) => r.id === selectedRegionId);
    return region?.cities ?? [];
  }, [regions, selectedRegionId]);

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
    await persistPatch(profileForm.getValues());
    goToStep(2);
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
    return <Navigate to="/" replace />;
  }

  const media = detail?.talent_application?.media ?? [];
  const profileImage = getTalentProfileImageUrl(detail?.talent_application);
  const readyForSubmit = detail ? isTalentApplicationReady(detail as TalentApplicationDetail) : false;

  return (
    <div className="space-y-6">
      {applicationStatus && applicationStatus !== 'draft' && applicationStatus !== 'not_started' ? (
        <ApplicationStatusBanner status={applicationStatus} />
      ) : null}

      <div className="rounded-3xl border border-ink-10 bg-white p-6 shadow-card-sm md:p-8">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-extrabold text-ink">
            {t(`application.step_${STEPS[stepIndex]}` as 'application.step_identity')}
          </h2>
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
            <Field label="Profile image">
              <div className="flex flex-wrap items-center gap-3">
                {profileImage ? (
                  <img src={profileImage} alt="" className="h-20 w-20 rounded-2xl object-cover ring-2 ring-ink-10" />
                ) : null}
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-ink-10 px-4 py-2 text-[13px] font-semibold hover:bg-ink-5">
                  <Upload size={16} />
                  Upload
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploading || !effectiveId}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void onProfileImageUpload(file);
                    }}
                  />
                </label>
                {uploading ? <Loader2 size={18} className="animate-spin text-ink-40" /> : null}
              </div>
            </Field>
            <Button type="button" variant="dark" onClick={() => void onIdentityNext()}>
              {t('common.continue')}
            </Button>
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
            <Field label={t('application.region')}>
              <Select
                {...profileForm.register('saudi_region_id', { valueAsNumber: true })}
                onChange={(e) => {
                  profileForm.setValue('saudi_region_id', Number(e.target.value) || undefined);
                  profileForm.setValue('city', undefined);
                }}
              >
                <option value="">—</option>
                {regions.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={t('application.city')}>
              <Select {...profileForm.register('city', { valueAsNumber: true })}>
                <option value="">—</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </Field>
            <label className="flex items-center gap-2 text-[14px] font-medium text-ink">
              <input type="checkbox" {...profileForm.register('travel_ready')} className="rounded border-ink-20" />
              {t('application.travelReady')}
            </label>
            <label className="flex items-center gap-2 text-[14px] font-medium text-ink">
              <input type="checkbox" {...profileForm.register('location_public')} className="rounded border-ink-20" />
              {t('application.locationPublic')}
            </label>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => goToStep(0)}>
                {t('common.back')}
              </Button>
              <Button type="button" variant="dark" onClick={() => void onProfileNext()}>
                {t('common.continue')}
              </Button>
            </div>
          </form>
        ) : null}

        {stepIndex === 2 ? (
          <form className="mt-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
            <Field label="Certificate name">
              <TextInput {...verificationForm.register('certificate_name')} />
            </Field>
            <div className="rounded-2xl border border-ink-10 bg-ink-5/40 p-4">
              <p className="text-[12px] font-semibold text-ink-60">Media gallery</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {(['image', 'video', 'certificate'] as const).map((kind) => (
                  <label
                    key={kind}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-ink-10 bg-white px-3 py-2 text-[12px] font-semibold hover:bg-ink-5"
                  >
                    <Upload size={14} />
                    {kind}
                    <input
                      type="file"
                      className="hidden"
                      disabled={uploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void onMediaUpload(file, kind);
                      }}
                    />
                  </label>
                ))}
              </div>
              <ul className="mt-4 space-y-2">
                {media.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-ink-10 bg-white px-3 py-2 text-[12px]"
                  >
                    <span className="truncate font-medium text-ink">
                      {item.label ?? item.kind}: {item.value}
                    </span>
                    <button
                      type="button"
                      className="rounded-full p-1.5 text-coral hover:bg-coral/10"
                      onClick={() => void onDeleteMedia(item.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </li>
                ))}
              </ul>
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
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => goToStep(1)}>
                {t('common.back')}
              </Button>
              <Button type="button" variant="dark" onClick={() => void onVerificationNext()}>
                {t('common.continue')}
              </Button>
            </div>
          </form>
        ) : null}

        {stepIndex === 3 ? (
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-ink-10 bg-ink-5/30 p-4 text-[14px] text-ink-60">
              <p>
                <strong className="text-ink">{identityForm.getValues('stage_name')}</strong> ·{' '}
                {identityForm.getValues('contact_email')}
              </p>
              <p className="mt-2 line-clamp-3">{profileForm.getValues('bio')}</p>
              <p className="mt-2 text-[12px]">
                {media.length} media item(s) · disclaimer{' '}
                {verificationForm.getValues('accepted_quality_disclaimer') ? 'accepted' : 'missing'}
              </p>
            </div>
            {!readyForSubmit ? (
              <p className="rounded-xl border border-coral/30 bg-coral/10 px-4 py-3 text-[13px] font-medium text-coral">
                {t('application.incomplete')}
              </p>
            ) : null}
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => goToStep(2)}>
                {t('common.back')}
              </Button>
              <Button
                type="button"
                variant="dark"
                loading={submitting}
                disabled={!readyForSubmit}
                onClick={() => void onSubmit()}
              >
                {t('application.submit')}
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
