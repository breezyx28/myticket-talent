import { Field } from '@/components/forms/Field';
import { Select } from '@/components/forms/Select';
import type { SaudiRegionRef } from '@/api/types/reference';
import { getSaudiCityLabel, getSaudiRegionLabel } from '@/lib/referenceLabels';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { TalentApplicationPatchSchema } from '@/schemas';
import type { FieldErrors, UseFormRegister, UseFormSetValue } from 'react-hook-form';

export function RegionCitySelect({
  regions,
  register,
  setValue,
  selectedRegionId,
  disabled,
  errors,
}: {
  regions: SaudiRegionRef[];
  register: UseFormRegister<TalentApplicationPatchSchema>;
  setValue: UseFormSetValue<TalentApplicationPatchSchema>;
  selectedRegionId?: number;
  disabled?: boolean;
  errors?: FieldErrors<TalentApplicationPatchSchema>;
}) {
  const { t, i18n } = useTranslation();

  const cities = useMemo(() => {
    const region = regions.find((r) => r.id === selectedRegionId);
    return region?.cities ?? [];
  }, [regions, selectedRegionId]);

  const emptyOption = t('common.empty');

  return (
    <>
      <Field label={t('application.region')} error={errors?.saudi_region_id?.message}>
        <Select
          {...register('saudi_region_id', { valueAsNumber: true })}
          disabled={disabled}
          onChange={(e) => {
            setValue('saudi_region_id', Number(e.target.value) || undefined);
            setValue('city', undefined);
          }}
        >
          <option value="">{emptyOption}</option>
          {regions.map((r) => (
            <option key={r.id} value={r.id}>
              {getSaudiRegionLabel(r, i18n.language)}
            </option>
          ))}
        </Select>
      </Field>
      <Field label={t('application.city')} error={errors?.city?.message}>
        <Select {...register('city', { valueAsNumber: true })} disabled={disabled || !selectedRegionId}>
          <option value="">{emptyOption}</option>
          {cities.map((c) => (
            <option key={c.id} value={c.id}>
              {getSaudiCityLabel(c, i18n.language)}
            </option>
          ))}
        </Select>
      </Field>
    </>
  );
}
