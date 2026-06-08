import * as yup from 'yup';
import {
  CONTACT_PHONE_MAX,
  MEDIA_URL_MAX,
  STAGE_NAME_MAX,
  TALENT_BIO_MAX_CHARS,
  TALENT_BIO_MIN_CHARS,
} from '@/lib/onboardingValidation';

export const createTalentApplicationSchema = yup
  .object({
    stage_name: yup
      .string()
      .trim()
      .min(2, 'Stage name is required.')
      .max(STAGE_NAME_MAX, `Maximum ${STAGE_NAME_MAX} characters.`)
      .required('Stage name is required.'),
    contact_email: yup
      .string()
      .trim()
      .email('Enter a valid email.')
      .required('Contact email is required.'),
    contact_phone: yup
      .string()
      .trim()
      .max(CONTACT_PHONE_MAX)
      .matches(/^\+?[0-9 ()-]{0,20}$/, 'Enter a valid phone number.')
      .notRequired(),
  })
  .strict();

export type CreateTalentApplicationSchema = yup.InferType<typeof createTalentApplicationSchema>;

export const talentApplicationPatchSchema = yup
  .object({
    stage_name: yup.string().trim().max(STAGE_NAME_MAX).notRequired(),
    contact_email: yup.string().trim().email().notRequired(),
    contact_phone: yup.string().trim().max(CONTACT_PHONE_MAX).notRequired(),
    profile_image: yup
      .string()
      .trim()
      .max(MEDIA_URL_MAX)
      .test('url', 'Must be a valid https URL.', (v) => !v || /^https?:\/\/.+/i.test(v))
      .notRequired(),
    bio: yup
      .string()
      .trim()
      .min(TALENT_BIO_MIN_CHARS, `Bio must be at least ${TALENT_BIO_MIN_CHARS} characters.`)
      .max(TALENT_BIO_MAX_CHARS)
      .notRequired(),
    saudi_region_id: yup.number().integer().positive().notRequired(),
    city: yup.number().integer().positive().notRequired(),
    travel_ready: yup.boolean().notRequired(),
    location_public: yup.boolean().notRequired(),
    certificate_name: yup.string().trim().max(255).notRequired(),
    accepted_quality_disclaimer: yup
      .boolean()
      .oneOf([true], 'You must accept the quality disclaimer.')
      .notRequired(),
  })
  .strict();

export type TalentApplicationPatchSchema = yup.InferType<typeof talentApplicationPatchSchema>;

export const talentMediaSchema = yup
  .object({
    kind: yup
      .string()
      .oneOf(['url', 'video', 'image', 'certificate'])
      .required('Media kind is required.'),
    value: yup
      .string()
      .trim()
      .max(MEDIA_URL_MAX)
      .url('Must be a valid URL.')
      .required('URL is required.'),
    label: yup.string().trim().max(255).notRequired(),
    position: yup.number().integer().min(0).notRequired(),
  })
  .strict();

export type TalentMediaSchema = yup.InferType<typeof talentMediaSchema>;
