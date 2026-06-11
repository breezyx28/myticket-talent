import { Button } from '@/components/ui/Button';
import { Field } from '@/components/forms/Field';
import { Select } from '@/components/forms/Select';
import { TextInput } from '@/components/forms/TextInput';
import { FileUploadButton } from '@/components/profile/FileUploadButton';
import {
  useGetGovernmentIdVerificationQuery,
  useSubmitGovernmentIdVerificationMutation,
} from '@/api/endpoints';
import type { GovernmentIdDocumentType } from '@/api/types/governmentId';
import { readApiErrorMessage } from '@/lib/apiErrors';
import { uploadToCdn } from '@/lib/upload';
import {
  governmentIdVerificationSchema,
  type GovernmentIdVerificationSchema,
} from '@/schemas/governmentId';
import { yupResolver } from '@hookform/resolvers/yup';
import { AlertCircle, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

type ImageField = 'front_image_url' | 'back_image_url' | 'selfie_url';

function StatusBadge({ status }: { status: 'pending' | 'verified' | 'rejected' | 'none' }) {
  const { t } = useTranslation();

  if (status === 'verified') {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-mint/15 px-3 py-1.5 text-[13px] font-semibold text-mint-dark">
        <CheckCircle2 size={16} />
        {t('governmentId.status_verified')}
      </span>
    );
  }
  if (status === 'pending') {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-sky/15 px-3 py-1.5 text-[13px] font-semibold text-sky-dark">
        <Clock size={16} />
        {t('governmentId.status_pending')}
      </span>
    );
  }
  if (status === 'rejected') {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-coral/10 px-3 py-1.5 text-[13px] font-semibold text-coral">
        <AlertCircle size={16} />
        {t('governmentId.status_rejected')}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-ink-5 px-3 py-1.5 text-[13px] font-semibold text-ink-60">
      {t('governmentId.status_not_submitted')}
    </span>
  );
}

function ImagePreview({ url, label }: { url: string | null | undefined; label: string }) {
  if (!url) return null;
  return (
    <figure className="space-y-1">
      <img src={url} alt="" className="h-24 w-full rounded-xl border border-ink-10 object-cover" />
      <figcaption className="text-[11px] font-medium text-ink-40">{label}</figcaption>
    </figure>
  );
}

export function GovernmentIdVerificationPanel() {
  const { t } = useTranslation();
  const pollIntervalRef = useRef(0);
  const {
    data: submission,
    isLoading,
    isError,
    refetch,
  } = useGetGovernmentIdVerificationQuery(undefined, {
    pollingInterval: pollIntervalRef.current,
  });
  pollIntervalRef.current = submission?.status === 'pending' ? 30_000 : 0;
  const [submitVerification, { isLoading: submitting }] = useSubmitGovernmentIdVerificationMutation();
  const [uploadingField, setUploadingField] = useState<ImageField | null>(null);

  const status = submission?.status;
  const canEditForm = status == null || status === 'rejected';
  const isPendingReview = status === 'pending';
  const isVerified = status === 'verified';

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<GovernmentIdVerificationSchema>({
    resolver: yupResolver(governmentIdVerificationSchema) as never,
    defaultValues: {
      document_type: 'national_id',
      document_number: '',
      front_image_url: '',
      back_image_url: '',
      selfie_url: '',
      issue_date: '',
      expiry_date: '',
    },
  });

  const frontUrl = watch('front_image_url');
  const backUrl = watch('back_image_url');
  const selfieUrl = watch('selfie_url');

  useEffect(() => {
    if (!submission || submission.status === 'rejected' || !canEditForm) return;
    reset({
      document_type: submission.document_type,
      document_number: submission.document_number ?? '',
      front_image_url: submission.front_image_url,
      back_image_url: submission.back_image_url ?? '',
      selfie_url: submission.selfie_url ?? '',
      issue_date: submission.issue_date ?? '',
      expiry_date: submission.expiry_date ?? '',
    });
  }, [canEditForm, submission, reset]);

  async function uploadImage(field: ImageField, file: File) {
    setUploadingField(field);
    try {
      const { url } = await uploadToCdn(file, 'talent_application');
      setValue(field, url, { shouldValidate: true, shouldDirty: true });
      toast.success(t('common.saved'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setUploadingField(null);
    }
  }

  async function onSubmit(values: GovernmentIdVerificationSchema) {
    try {
      await submitVerification({
        document_type: values.document_type as GovernmentIdDocumentType,
        document_number: values.document_number || null,
        front_image_url: values.front_image_url,
        back_image_url: values.back_image_url || null,
        selfie_url: values.selfie_url || null,
        issue_date: values.issue_date || null,
        expiry_date: values.expiry_date || null,
      }).unwrap();
      toast.success(t('governmentId.submitSuccess'));
    } catch (err) {
      toast.error(readApiErrorMessage(err, t('common.error')));
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 rounded-3xl border border-ink-10 bg-white p-6 text-[14px] text-ink-60">
        <Loader2 size={18} className="animate-spin" />
        {t('common.loading')}
      </div>
    );
  }

  const displayStatus =
    status === 'pending' || status === 'verified' || status === 'rejected' ? status : 'none';

  return (
    <section
      id="government-id-verification"
      className="space-y-4 rounded-3xl border border-ink-10 bg-white p-6 shadow-card-sm"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-[16px] font-bold text-ink">{t('governmentId.title')}</h2>
          <p className="mt-1 text-[13px] text-ink-60">{t('governmentId.hint')}</p>
        </div>
        <StatusBadge status={displayStatus} />
      </div>

      {isError ? (
        <div className="rounded-2xl border border-coral/30 bg-coral/10 px-4 py-3 text-[13px] text-coral">
          <p>{t('governmentId.loadError')}</p>
          <button
            type="button"
            className="mt-2 font-semibold underline"
            onClick={() => void refetch()}
          >
            {t('common.retry')}
          </button>
        </div>
      ) : null}

      {submission?.status === 'rejected' && submission.rejection_reason ? (
        <div className="rounded-2xl border border-coral/30 bg-coral/10 px-4 py-3 text-[13px] text-coral">
          <p className="font-semibold">{t('governmentId.rejectionReason')}</p>
          <p className="mt-1">{submission.rejection_reason}</p>
        </div>
      ) : null}

      {submission && !canEditForm ? (
        <div className="space-y-4 rounded-2xl border border-ink-10 bg-surface-muted px-4 py-4">
          <dl className="grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-ink-40">
                {t('governmentId.documentType')}
              </dt>
              <dd className="mt-0.5 text-[14px] font-medium text-ink">
                {t(`governmentId.type_${submission.document_type}` as 'governmentId.type_national_id')}
              </dd>
            </div>
            {submission.document_number ? (
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-ink-40">
                  {t('governmentId.documentNumber')}
                </dt>
                <dd className="mt-0.5 text-[14px] font-medium text-ink" dir="ltr">
                  {submission.document_number}
                </dd>
              </div>
            ) : null}
            {submission.issue_date ? (
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-ink-40">
                  {t('governmentId.issueDate')}
                </dt>
                <dd className="mt-0.5 text-[14px] font-medium text-ink" dir="ltr">
                  {submission.issue_date}
                </dd>
              </div>
            ) : null}
            {submission.expiry_date ? (
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-ink-40">
                  {t('governmentId.expiryDate')}
                </dt>
                <dd className="mt-0.5 text-[14px] font-medium text-ink" dir="ltr">
                  {submission.expiry_date}
                </dd>
              </div>
            ) : null}
          </dl>
          <div className="grid gap-3 sm:grid-cols-3">
            <ImagePreview url={submission.front_image_url} label={t('governmentId.frontImage')} />
            <ImagePreview url={submission.back_image_url} label={t('governmentId.backImage')} />
            <ImagePreview url={submission.selfie_url} label={t('governmentId.selfie')} />
          </div>
        </div>
      ) : null}

      {isPendingReview ? (
        <p className="rounded-2xl border border-sky/30 bg-sky/10 px-4 py-3 text-[13px] text-ink-60">
          {t('governmentId.pendingHint')}
        </p>
      ) : null}

      {isVerified ? (
        <p className="rounded-2xl border border-mint/30 bg-mint/10 px-4 py-3 text-[13px] text-mint-dark">
          {t('governmentId.verifiedHint')}
        </p>
      ) : null}

      {canEditForm ? (
        <form className="space-y-4 border-t border-ink-10 pt-4" onSubmit={handleSubmit(onSubmit)}>
          <Field label={t('governmentId.documentType')} error={errors.document_type?.message}>
            <Select {...register('document_type')} hasError={Boolean(errors.document_type)}>
              <option value="national_id">{t('governmentId.type_national_id')}</option>
              <option value="iqama">{t('governmentId.type_iqama')}</option>
              <option value="passport">{t('governmentId.type_passport')}</option>
            </Select>
          </Field>

          <Field label={t('governmentId.documentNumber')} error={errors.document_number?.message}>
            <TextInput
              {...register('document_number')}
              dir="ltr"
              hasError={Boolean(errors.document_number)}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            {(
              [
                ['front_image_url', t('governmentId.frontImage'), true],
                ['back_image_url', t('governmentId.backImage'), false],
                ['selfie_url', t('governmentId.selfie'), false],
              ] as const
            ).map(([field, label, required]) => {
              const url =
                field === 'front_image_url' ? frontUrl : field === 'back_image_url' ? backUrl : selfieUrl;
              const fieldError = errors[field]?.message;
              return (
                <div key={field} className="space-y-2">
                  <p className="text-[12px] font-semibold text-ink">
                    {label}
                    {required ? ' *' : ''}
                  </p>
                  {url ? (
                    <img src={url} alt="" className="h-24 w-full rounded-xl border border-ink-10 object-cover" />
                  ) : null}
                  <FileUploadButton
                    label={url ? t('governmentId.replaceImage') : t('governmentId.uploadImage')}
                    accept="image/*"
                    loading={uploadingField === field}
                    onFile={(file) => void uploadImage(field, file)}
                  />
                  {fieldError ? <p className="text-[11px] font-medium text-coral">{fieldError}</p> : null}
                </div>
              );
            })}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t('governmentId.issueDate')} error={errors.issue_date?.message}>
              <TextInput {...register('issue_date')} type="date" dir="ltr" />
            </Field>
            <Field label={t('governmentId.expiryDate')} error={errors.expiry_date?.message}>
              <TextInput {...register('expiry_date')} type="date" dir="ltr" />
            </Field>
          </div>

          <Button type="submit" variant="primary" loading={submitting}>
            {submission?.status === 'rejected' ? t('governmentId.resubmit') : t('governmentId.submit')}
          </Button>
        </form>
      ) : null}
    </section>
  );
}
