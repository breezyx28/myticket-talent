import { Button } from '@/components/ui/Button';
import { Field } from '@/components/forms/Field';
import { TextArea } from '@/components/forms/TextArea';
import { TextInput } from '@/components/forms/TextInput';
import { TalentCategoryPicker } from '@/components/profile/TalentCategoryPicker';
import { useSyncTalentProfileCategoriesMutation, useUpdateTalentProfileMutation } from '@/api/endpoints';
import { readApiErrorMessage } from '@/lib/apiErrors';
import { hasMinimumCategories } from '@/lib/talentCategories';
import type { SyncTalentCategoryItem } from '@/api/types/talentCategory';
import type { RoleApplicationTalentDetail } from '@/api/types/roleApplication';
import type { TalentProfileMe } from '@/api/types/user';
import { buildUpdateTalentProfileSchema, type UpdateTalentProfileSchema } from '@/schemas/profile';
import { useLocalizedYupResolver } from '@/hooks/useLocalizedYupResolver';
import { useRevalidateFormOnLanguageChange } from '@/hooks/useRevalidateFormOnLanguageChange';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

export function ProfileBasicSection({
  profile,
  application,
}: {
  profile: TalentProfileMe;
  application?: RoleApplicationTalentDetail | null;
}) {
  const { t, i18n } = useTranslation();
  const [categoryPayload, setCategoryPayload] = useState<SyncTalentCategoryItem[]>([]);
  const [updateProfile, { isLoading: savingProfile }] = useUpdateTalentProfileMutation();
  const [syncProfileCategories, { isLoading: savingCategories }] =
    useSyncTalentProfileCategoriesMutation();

  const profileSchema = useMemo(() => buildUpdateTalentProfileSchema(t), [t, i18n.language]);
  const profileResolver = useLocalizedYupResolver(profileSchema);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    trigger,
  } = useForm<UpdateTalentProfileSchema>({
    resolver: profileResolver as never,
    defaultValues: {
      stage_name: '',
      bio: '',
      website_url: '',
      instagram_handle: '',
      travel_ready: false,
      location_public: false,
    },
  });

  useRevalidateFormOnLanguageChange(trigger);

  useEffect(() => {
    reset({
      stage_name: profile.stage_name,
      bio: profile.bio ?? '',
      website_url: profile.website_url ?? '',
      instagram_handle: profile.instagram_handle ?? '',
      travel_ready: profile.travel_ready,
      location_public: profile.location_public,
    });
  }, [profile, reset]);

  async function onSubmit(values: UpdateTalentProfileSchema) {
    if (!hasMinimumCategories(categoryPayload.length)) {
      toast.error(t('categories.minRequired'));
      return;
    }

    try {
      await syncProfileCategories({ categories: categoryPayload }).unwrap();
      await updateProfile({
        stage_name: values.stage_name ?? undefined,
        bio: values.bio ?? null,
        website_url: values.website_url ?? null,
        instagram_handle: values.instagram_handle ?? null,
        travel_ready: values.travel_ready ?? undefined,
        location_public: values.location_public ?? undefined,
      }).unwrap();
      toast.success(t('common.saved'));
    } catch (err) {
      toast.error(readApiErrorMessage(err, t('common.error')));
    }
  }

  const saving = savingProfile || savingCategories;

  return (
    <form className="space-y-4 rounded-3xl border border-ink-10 bg-white p-6 shadow-card-sm" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label={t('application.contactEmail')}>
          <TextInput value={application?.contact_email ?? ''} dir="ltr" readOnly disabled className="bg-ink-5/50" />
        </Field>
        <Field label={t('application.contactPhone')}>
          <TextInput value={application?.contact_phone ?? ''} dir="ltr" readOnly disabled className="bg-ink-5/50" />
        </Field>
      </div>
      <p className="text-[12px] text-ink-40">{t('profile.contactReadOnly')}</p>

      <Field label={t('profile.stageName')} error={errors.stage_name?.message}>
        <TextInput {...register('stage_name')} hasError={Boolean(errors.stage_name)} />
      </Field>

      <div className="rounded-2xl border border-ink-10 bg-surface-muted p-4">
        <TalentCategoryPicker
          mode="profile"
          initialCategories={profile.categories}
          onSelectionChange={setCategoryPayload}
        />
      </div>
      <Field label={t('profile.bio')} error={errors.bio?.message}>
        <TextArea {...register('bio')} rows={5} hasError={Boolean(errors.bio)} />
      </Field>
      <Field label={t('profile.website')} error={errors.website_url?.message}>
        <TextInput {...register('website_url')} dir="ltr" hasError={Boolean(errors.website_url)} />
      </Field>
      <Field label={t('profile.instagram')} error={errors.instagram_handle?.message}>
        <TextInput {...register('instagram_handle')} dir="ltr" hasError={Boolean(errors.instagram_handle)} />
      </Field>
      <label className="flex items-center gap-2 text-[14px] font-medium text-ink">
        <input type="checkbox" {...register('travel_ready')} className="rounded border-ink-20" />
        {t('profile.travelReady')}
      </label>
      <label className="flex items-center gap-2 text-[14px] font-medium text-ink">
        <input type="checkbox" {...register('location_public')} className="rounded border-ink-20" />
        {t('profile.locationPublic')}
      </label>

      <Button type="submit" variant="primary" loading={saving}>
        {t('profile.saveChanges')}
      </Button>
    </form>
  );
}
