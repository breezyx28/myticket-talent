import * as yup from 'yup';
import i18n from '@/i18n';
import {
  CONTACT_PHONE_MAX,
  MEDIA_URL_MAX,
  STAGE_NAME_MAX,
  TALENT_BIO_MAX_CHARS,
  TALENT_BIO_MIN_CHARS,
} from '@/lib/onboardingValidation';
import type { SchemaT } from '@/schemas/i18n';

const defaultT: SchemaT = (k, o) => i18n.t(k, o);

export function buildCreateTalentApplicationSchema(t: SchemaT) {
  return yup
    .object({
      stage_name: yup
        .string()
        .trim()
        .min(2, t('validation.stageNameRequired'))
        .max(STAGE_NAME_MAX, t('validation.stageNameMax', { max: STAGE_NAME_MAX }))
        .required(t('validation.stageNameRequired')),
      contact_email: yup
        .string()
        .trim()
        .email(t('validation.emailInvalid'))
        .required(t('validation.contactEmailRequired')),
      contact_phone: yup
        .string()
        .trim()
        .max(CONTACT_PHONE_MAX)
        .matches(/^\+?[0-9 ()-]{0,20}$/, t('validation.phoneInvalid'))
        .notRequired(),
    })
    .strict();
}

export const createTalentApplicationSchema = buildCreateTalentApplicationSchema(defaultT);

export type CreateTalentApplicationSchema = yup.InferType<typeof createTalentApplicationSchema>;

export function buildTalentApplicationPatchSchema(t: SchemaT) {
  return yup
    .object({
      stage_name: yup.string().trim().max(STAGE_NAME_MAX).notRequired(),
      contact_email: yup.string().trim().email(t('validation.emailInvalid')).notRequired(),
      contact_phone: yup.string().trim().max(CONTACT_PHONE_MAX).notRequired(),
      profile_image: yup
        .string()
        .trim()
        .max(MEDIA_URL_MAX)
        .test('url', t('validation.urlHttps'), (v) => !v || /^https?:\/\/.+/i.test(v))
        .notRequired(),
      bio: yup
        .string()
        .trim()
        .min(TALENT_BIO_MIN_CHARS, t('validation.bioMin', { min: TALENT_BIO_MIN_CHARS }))
        .max(TALENT_BIO_MAX_CHARS)
        .notRequired(),
      saudi_region_id: yup.number().integer().positive().notRequired(),
      city: yup.number().integer().positive().notRequired(),
      travel_ready: yup.boolean().notRequired(),
      location_public: yup.boolean().notRequired(),
      certificate_name: yup.string().trim().max(255).notRequired(),
      accepted_quality_disclaimer: yup
        .boolean()
        .oneOf([true], t('validation.disclaimerRequired'))
        .notRequired(),
    })
    .strict();
}

export const talentApplicationPatchSchema = buildTalentApplicationPatchSchema(defaultT);

export type TalentApplicationPatchSchema = yup.InferType<typeof talentApplicationPatchSchema>;

export function buildTalentMediaSchema(t: SchemaT) {
  return yup
    .object({
      kind: yup
        .string()
        .oneOf(['url', 'video', 'image', 'certificate'])
        .required(t('validation.mediaKindRequired')),
      value: yup
        .string()
        .trim()
        .max(MEDIA_URL_MAX)
        .url(t('validation.urlInvalid'))
        .required(t('validation.urlRequired')),
      label: yup.string().trim().max(255).notRequired(),
      position: yup.number().integer().min(0).notRequired(),
    })
    .strict();
}

export const talentMediaSchema = buildTalentMediaSchema(defaultT);

export type TalentMediaSchema = yup.InferType<typeof talentMediaSchema>;
