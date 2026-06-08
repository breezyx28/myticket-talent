import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Field } from '@/components/forms/Field';
import { TextArea } from '@/components/forms/TextArea';
import { TextInput } from '@/components/forms/TextInput';
import {
  useGetSaudiRegionsQuery,
  useGetTalentProfileQuery,
  useUpdateTalentProfileMutation,
} from '@/api/endpoints';
import { ENV } from '@/config/env';
import { readApiErrorMessage } from '@/lib/apiErrors';
import { updateTalentProfileSchema, type UpdateTalentProfileSchema } from '@/schemas/profile';
import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

export function ProfilePage() {
  const { t } = useTranslation();
  const { data: profile } = useGetTalentProfileQuery();
  const { data: regionsData } = useGetSaudiRegionsQuery();
  const [updateProfile, { isLoading }] = useUpdateTalentProfileMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateTalentProfileSchema>({
    resolver: yupResolver(updateTalentProfileSchema) as never,
    defaultValues: {
      stage_name: '',
      bio: '',
      website_url: '',
      instagram_handle: '',
      travel_ready: false,
      location_public: false,
    },
  });

  useEffect(() => {
    if (!profile) return;
    reset({
      stage_name: profile.stage_name,
      bio: profile.bio ?? '',
      website_url: profile.website_url ?? '',
      instagram_handle: profile.instagram_handle ?? '',
      travel_ready: profile.travel_ready,
      location_public: profile.location_public,
    });
  }, [profile, reset]);

  const regionLabel = useMemo(() => {
    if (!profile?.region_id) return null;
    const region = regionsData?.data.find((r) => r.id === profile.region_id);
    const city = region?.cities.find((c) => c.id === profile.city_id);
    return [region?.name, city?.name].filter(Boolean).join(', ');
  }, [profile, regionsData]);

  async function onSubmit(values: UpdateTalentProfileSchema) {
    try {
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

  if (!profile) return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[28px] font-extrabold text-ink">{t('profile.title')}</h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <div className="space-y-4">
          {profile.profile_image_url ? (
            <img
              src={profile.profile_image_url}
              alt=""
              className="aspect-square w-full rounded-3xl object-cover ring-2 ring-ink-10"
            />
          ) : (
            <div className="flex aspect-square w-full items-center justify-center rounded-3xl bg-ink-5 text-ink-40">
              —
            </div>
          )}
          <p className="text-[12px] text-ink-40">{t('profile.readOnlyImage')}</p>
          {profile.gallery && profile.gallery.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {profile.gallery.map((item) => (
                <img
                  key={item.id}
                  src={item.image_url}
                  alt={item.caption ?? ''}
                  className="aspect-square rounded-xl object-cover"
                />
              ))}
            </div>
          ) : null}
        </div>

        <form className="space-y-4 rounded-3xl border border-ink-10 bg-white p-6 shadow-card-sm" onSubmit={handleSubmit(onSubmit)}>
          <Field label={t('profile.stageName')} error={errors.stage_name?.message}>
            <TextInput {...register('stage_name')} hasError={Boolean(errors.stage_name)} />
          </Field>
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

          <div className="rounded-2xl border border-ink-10 bg-ink-5/40 p-4 text-[13px] text-ink-60">
            <p className="font-semibold text-ink">{t('profile.publicSlug')}</p>
            <a
              href={`${ENV.mainWebsiteUrl}/artists/${profile.slug}`}
              className="mt-1 inline-block font-mono text-coral hover:underline"
              dir="ltr"
              rel="noreferrer"
            >
              /artists/{profile.slug}
            </a>
            {regionLabel ? <p className="mt-2">{regionLabel}</p> : null}
            {profile.categories?.map((c) => (
              <Badge key={c.id} className="mt-2 me-2">
                #{c.talent_category_id}
              </Badge>
            ))}
          </div>

          <Button type="submit" variant="dark" loading={isLoading}>
            {t('profile.saveChanges')}
          </Button>
        </form>
      </div>
    </div>
  );
}
