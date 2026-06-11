import { AvailabilityToggle } from '@/components/talent/AvailabilityToggle';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  useGetTalentAvailabilityQuery,
  useSetTalentAvailabilityMutation,
} from '@/api/endpoints';
import type { TalentAvailability } from '@/types/domain';
import { RegionCitySelect } from '@/components/profile/RegionCitySelect';
import {
  useGetSaudiRegionsQuery,
  useUpdateTalentApplicationMutation,
  useUpdateTalentProfileMutation,
} from '@/api/endpoints';
import { readApiErrorMessage } from '@/lib/apiErrors';
import { canEditTalentApplication } from '@/lib/roleApplicationEdit';
import { getTalentCityId, getTalentRegionId } from '@/lib/talentApplicationFields';
import type { RoleApplicationDetail } from '@/api/types/roleApplication';
import type { TalentProfileMe } from '@/api/types/user';
import { talentApplicationPatchSchema, type TalentApplicationPatchSchema } from '@/schemas';
import { ENV } from '@/config/env';
import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

export function ProfileLocationSection({
  profile,
  applicationDetail,
}: {
  profile: TalentProfileMe;
  applicationDetail?: RoleApplicationDetail | null;
}) {
  const { t } = useTranslation();
  const { data: availability, isLoading: loadingAvailability } = useGetTalentAvailabilityQuery();
  const [setAvailability, { isLoading: savingAvailability }] = useSetTalentAvailabilityMutation();
  const { data: regionsData } = useGetSaudiRegionsQuery();
  const regions = regionsData?.data ?? [];
  const [updateApplication, { isLoading: savingApp }] = useUpdateTalentApplicationMutation();
  const [updateProfile, { isLoading: savingProfile }] = useUpdateTalentProfileMutation();

  const application = applicationDetail?.talent_application;
  const canEdit = canEditTalentApplication(applicationDetail?.status);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TalentApplicationPatchSchema>({
    resolver: yupResolver(talentApplicationPatchSchema) as never,
    defaultValues: {
      saudi_region_id: undefined,
      city: undefined,
      travel_ready: false,
      location_public: false,
    },
  });

  const selectedRegionId = watch('saudi_region_id');

  useEffect(() => {
    reset({
      saudi_region_id: getTalentRegionId(application ?? undefined) ?? profile.region_id ?? undefined,
      city: getTalentCityId(application ?? undefined) ?? profile.city_id ?? undefined,
      travel_ready: profile.travel_ready,
      location_public: profile.location_public,
    });
  }, [application, profile, reset]);

  const regionLabel = useMemo(() => {
    const regionId = profile.region_id;
    if (!regionId) return null;
    const region = regions.find((r) => r.id === regionId);
    const city = region?.cities.find((c) => c.id === profile.city_id);
    return [region?.name, city?.name].filter(Boolean).join(', ');
  }, [profile, regions]);

  const availabilityStatus: TalentAvailability =
    availability?.status ?? profile.availability_status ?? 'available';

  async function onAvailabilityChange(next: TalentAvailability) {
    try {
      await setAvailability({ status: next }).unwrap();
      toast.success(t('common.saved'));
    } catch (err) {
      toast.error(readApiErrorMessage(err, t('common.error')));
    }
  }

  async function onSubmit(values: TalentApplicationPatchSchema) {
    try {
      await updateProfile({
        travel_ready: values.travel_ready ?? undefined,
        location_public: values.location_public ?? undefined,
      }).unwrap();

      if (canEdit && applicationDetail?.id) {
        await updateApplication({
          id: applicationDetail.id,
          body: {
            saudi_region_id: values.saudi_region_id ?? undefined,
            city: values.city ?? undefined,
            travel_ready: values.travel_ready ?? undefined,
            location_public: values.location_public ?? undefined,
          },
        }).unwrap();
      }

      toast.success(t('common.saved'));
    } catch (err) {
      toast.error(readApiErrorMessage(err, t('common.error')));
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-ink-10 bg-surface-muted p-5">
        <p className="font-semibold text-ink">{t('availability.title')}</p>
        <p className="mt-1 text-[13px] text-ink-60">
          {availabilityStatus === 'available' ? t('availability.availableHint') : t('availability.reservedHint')}
        </p>
        <div className="mt-4">
          {loadingAvailability ? (
            <p className="text-[13px] text-ink-40">{t('common.loading')}</p>
          ) : (
            <AvailabilityToggle
              status={availabilityStatus}
              onChange={(next) => void onAvailabilityChange(next)}
              disabled={savingAvailability}
            />
          )}
        </div>
      </div>

      <form
        className="space-y-4 rounded-3xl border border-ink-10 bg-white p-6 shadow-card-sm"
        onSubmit={handleSubmit(onSubmit)}
      >
        {canEdit ? (
          <RegionCitySelect
            regions={regions}
            register={register}
            setValue={setValue}
            selectedRegionId={selectedRegionId ?? undefined}
            errors={errors}
          />
        ) : (
          <div className="rounded-2xl border border-ink-10 bg-ink-5/40 p-4 text-[14px] text-ink-60">
            <p className="font-semibold text-ink">{t('profile.currentLocation')}</p>
            <p className="mt-1">{regionLabel ?? t('profile.locationUnset')}</p>
            <p className="mt-3 text-[12px]">{t('profile.locationLocked')}</p>
          </div>
        )}

        <label className="flex items-center gap-2 text-[14px] font-medium text-ink">
          <input type="checkbox" {...register('travel_ready')} className="rounded border-ink-20" />
          {t('profile.travelReady')}
        </label>
        <label className="flex items-center gap-2 text-[14px] font-medium text-ink">
          <input type="checkbox" {...register('location_public')} className="rounded border-ink-20" />
          {t('profile.locationPublic')}
        </label>

        <Button type="submit" variant="primary" loading={savingApp || savingProfile}>
          {t('profile.saveChanges')}
        </Button>
      </form>

      <div className="rounded-3xl border border-ink-10 bg-white p-6 shadow-card-sm">
        <p className="font-semibold text-ink">{t('profile.publicSlug')}</p>
        <a
          href={`${ENV.mainWebsiteUrl}/artists/${profile.slug}`}
          className="mt-1 inline-block font-mono text-coral hover:underline"
          dir="ltr"
          rel="noreferrer"
        >
          /artists/{profile.slug}
        </a>
        {profile.categories?.map((c) => (
          <Badge key={c.id} className="mt-3 me-2">
            #{c.talent_category_id}
          </Badge>
        ))}
      </div>
    </div>
  );
}
