import * as yup from 'yup';
import { STAGE_NAME_MAX } from '@/lib/onboardingValidation';

export const updateTalentProfileSchema = yup
  .object({
    stage_name: yup.string().trim().max(STAGE_NAME_MAX).notRequired(),
    bio: yup.string().trim().max(2000).nullable().notRequired(),
    website_url: yup.string().trim().url().max(500).nullable().notRequired(),
    instagram_handle: yup.string().trim().max(120).nullable().notRequired(),
    travel_ready: yup.boolean().notRequired(),
    location_public: yup.boolean().notRequired(),
  })
  .strict();

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

export const talentAvailabilitySchema = yup
  .object({
    status: yup
      .string()
      .oneOf(['available', 'reserved'], 'Status must be available or reserved.')
      .required('Status is required.'),
  })
  .strict();

export type TalentAvailabilitySchema = yup.InferType<typeof talentAvailabilitySchema>;
