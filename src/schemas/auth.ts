import * as yup from 'yup';

export const loginSchema = yup
  .object({
    email: yup
      .string()
      .trim()
      .email('Enter a valid email.')
      .required('Email is required.'),
    password: yup.string().required('Password is required.'),
  })
  .strict();

export type LoginSchema = yup.InferType<typeof loginSchema>;

export const forgotPasswordSchema = yup
  .object({
    email: yup
      .string()
      .trim()
      .email('Enter a valid email.')
      .required('Email is required.'),
  })
  .strict();

export type ForgotPasswordSchema = yup.InferType<typeof forgotPasswordSchema>;

export const resetPasswordSchema = yup
  .object({
    token: yup.string().trim().required('Reset token is required.'),
    password: yup
      .string()
      .min(8, 'Password must be at least 8 characters.')
      .max(128, 'Password is too long.')
      .required('Password is required.'),
    password_confirmation: yup
      .string()
      .oneOf([yup.ref('password')], 'Passwords must match.')
      .required('Confirm your new password.'),
  })
  .strict();

export type ResetPasswordSchema = yup.InferType<typeof resetPasswordSchema>;
