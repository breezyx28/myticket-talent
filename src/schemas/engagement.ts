import * as yup from 'yup';

export const engagementMessageSchema = yup
  .object({
    body: yup
      .string()
      .trim()
      .min(1, 'Message cannot be empty.')
      .max(4000, 'Message is too long.')
      .required('Message is required.'),
    attachment_url: yup.string().trim().url('Attachment must be a valid URL.').notRequired(),
  })
  .strict();

export type EngagementMessageSchema = yup.InferType<typeof engagementMessageSchema>;

export const declineEngagementSchema = yup
  .object({
    reason: yup.string().trim().max(500, 'Reason is too long.').notRequired(),
  })
  .strict();

export type DeclineEngagementSchema = yup.InferType<typeof declineEngagementSchema>;
