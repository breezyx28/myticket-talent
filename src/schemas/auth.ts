import * as yup from 'yup';
import i18n from '@/i18n';
import type { SchemaT } from '@/schemas/i18n';

const defaultT: SchemaT = (k, o) => i18n.t(k, o);

export function buildLoginSchema(t: SchemaT) {
  return yup
    .object({
      email: yup
        .string()
        .trim()
        .email(t('validation.emailInvalid'))
        .required(t('validation.emailRequired')),
      password: yup.string().required(t('validation.passwordRequired')),
    })
    .strict();
}

export const loginSchema = buildLoginSchema(defaultT);

export type LoginSchema = yup.InferType<typeof loginSchema>;

export function buildForgotPasswordSchema(t: SchemaT) {
  return yup
    .object({
      email: yup
        .string()
        .trim()
        .email(t('validation.emailInvalid'))
        .required(t('validation.emailRequired')),
    })
    .strict();
}

export const forgotPasswordSchema = buildForgotPasswordSchema(defaultT);

export type ForgotPasswordSchema = yup.InferType<typeof forgotPasswordSchema>;

export function buildResetPasswordSchema(t: SchemaT) {
  return yup
    .object({
      token: yup.string().trim().required(t('validation.resetTokenRequired')),
      password: yup
        .string()
        .min(8, t('validation.passwordMin', { min: 8 }))
        .max(128, t('validation.passwordMax'))
        .required(t('validation.passwordRequired')),
      password_confirmation: yup
        .string()
        .oneOf([yup.ref('password')], t('validation.passwordMismatch'))
        .required(t('validation.passwordConfirmRequired')),
    })
    .strict();
}

export const resetPasswordSchema = buildResetPasswordSchema(defaultT);

export type ResetPasswordSchema = yup.InferType<typeof resetPasswordSchema>;

export function buildOtpSchema(t: SchemaT) {
  return yup
    .object({
      otp: yup.string().trim().required(t('validation.otpRequired')),
    })
    .strict();
}

export type OtpSchema = yup.InferType<ReturnType<typeof buildOtpSchema>>;
