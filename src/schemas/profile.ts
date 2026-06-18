import * as yup from 'yup';
import i18n from '@/i18n';
import { STAGE_NAME_MAX } from '@/lib/onboardingValidation';
import type { SchemaT } from '@/schemas/i18n';

const defaultT: SchemaT = (k, o) => i18n.t(k, o);

export function buildUpdateTalentProfileSchema(t: SchemaT) {
  return yup
    .object({
      stage_name: yup.string().trim().max(STAGE_NAME_MAX).notRequired(),
      bio: yup.string().trim().max(2000).nullable().notRequired(),
      website_url: yup.string().trim().url(t('validation.urlInvalid')).max(500).nullable().notRequired(),
      instagram_handle: yup.string().trim().max(120).nullable().notRequired(),
      travel_ready: yup.boolean().notRequired(),
      location_public: yup.boolean().notRequired(),
    })
    .strict();
}

export const updateTalentProfileSchema = buildUpdateTalentProfileSchema(defaultT);

export type UpdateTalentProfileSchema = yup.InferType<typeof updateTalentProfileSchema>;

export const updatePreferencesSchema = yup
  .object({
    language: yup.string().oneOf(['en', 'ar']).notRequired(),
    theme: yup.string().oneOf(['system', 'light', 'dark']).notRequired(),
    email_notifications: yup.boolean().notRequired(),
    push_notifications: yup.boolean().notRequired(),
    sms_notifications: yup.boolean().notRequired(),
    marketing_emails: yup.boolean().notRequired(),
  })
  .strict();

export type UpdatePreferencesSchema = yup.InferType<typeof updatePreferencesSchema>;

export function buildTalentAvailabilitySchema(t: SchemaT) {
  return yup
    .object({
      status: yup
        .string()
        .oneOf(['available', 'reserved'])
        .required(t('validation.statusRequired')),
    })
    .strict();
}

export const talentAvailabilitySchema = buildTalentAvailabilitySchema(defaultT);

export type TalentAvailabilitySchema = yup.InferType<typeof talentAvailabilitySchema>;
