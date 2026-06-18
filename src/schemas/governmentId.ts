import * as yup from 'yup';
import i18n from '@/i18n';
import type { SchemaT } from '@/schemas/i18n';

const defaultT: SchemaT = (k, o) => i18n.t(k, o);

export function buildGovernmentIdVerificationSchema(t: SchemaT) {
  const urlField = yup
    .string()
    .trim()
    .url(t('validation.urlInvalid'))
    .max(500)
    .required(t('validation.imageRequired'));

  return yup
    .object({
      document_type: yup
        .string()
        .oneOf(['national_id', 'iqama', 'passport'])
        .required(t('validation.documentTypeRequired')),
      document_number: yup.string().trim().max(64).nullable().notRequired(),
      front_image_url: urlField,
      back_image_url: yup.string().trim().url(t('validation.urlInvalid')).max(500).nullable().notRequired(),
      selfie_url: yup.string().trim().url(t('validation.urlInvalid')).max(500).nullable().notRequired(),
      issue_date: yup.string().trim().nullable().notRequired(),
      expiry_date: yup.string().trim().nullable().notRequired(),
    })
    .strict();
}

export const governmentIdVerificationSchema = buildGovernmentIdVerificationSchema(defaultT);

export type GovernmentIdVerificationSchema = yup.InferType<typeof governmentIdVerificationSchema>;
