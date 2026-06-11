import * as yup from 'yup';

const urlField = yup
  .string()
  .trim()
  .url('Must be a valid URL.')
  .max(500)
  .required('This image is required.');

export const governmentIdVerificationSchema = yup
  .object({
    document_type: yup
      .string()
      .oneOf(['national_id', 'iqama', 'passport'], 'Select a document type.')
      .required('Document type is required.'),
    document_number: yup.string().trim().max(64).nullable().notRequired(),
    front_image_url: urlField,
    back_image_url: yup.string().trim().url().max(500).nullable().notRequired(),
    selfie_url: yup.string().trim().url().max(500).nullable().notRequired(),
    issue_date: yup.string().trim().nullable().notRequired(),
    expiry_date: yup.string().trim().nullable().notRequired(),
  })
  .strict();

export type GovernmentIdVerificationSchema = yup.InferType<typeof governmentIdVerificationSchema>;
