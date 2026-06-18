import * as yup from 'yup';
import i18n from '@/i18n';
import type { SchemaT } from '@/schemas/i18n';

const defaultT: SchemaT = (k, o) => i18n.t(k, o);

export function buildEngagementMessageSchema(t: SchemaT) {
  return yup
    .object({
      body: yup
        .string()
        .trim()
        .max(4000, t('validation.messageTooLong'))
        .required(t('validation.messageRequired')),
      attachment_url: yup
        .string()
        .trim()
        .url(t('validation.attachmentUrlInvalid'))
        .notRequired(),
    })
    .strict();
}

export const engagementMessageSchema = buildEngagementMessageSchema(defaultT);

export type EngagementMessageSchema = yup.InferType<typeof engagementMessageSchema>;

export function buildDeclineEngagementSchema(t: SchemaT) {
  return yup
    .object({
      reason: yup.string().trim().max(500, t('validation.reasonTooLong')).notRequired(),
    })
    .strict();
}

export const declineEngagementSchema = buildDeclineEngagementSchema(defaultT);

export type DeclineEngagementSchema = yup.InferType<typeof declineEngagementSchema>;
