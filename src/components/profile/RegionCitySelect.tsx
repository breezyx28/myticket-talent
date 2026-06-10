import { Field } from '@/components/forms/Field';
import { Select } from '@/components/forms/Select';
import type { SaudiRegionRef } from '@/api/types/reference';
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
  const { t } = useTranslation();

  const cities = useMemo(() => {
    const region = regions.find((r) => r.id === selectedRegionId);
    return region?.cities ?? [];
  }, [regions, selectedRegionId]);

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
          <option value="">—</option>
          {regions.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </Select>
      </Field>
      <Field label={t('application.city')} error={errors?.city?.message}>
        <Select {...register('city', { valueAsNumber: true })} disabled={disabled || !selectedRegionId}>
          <option value="">—</option>
          {cities.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </Field>
    </>
  );
}
