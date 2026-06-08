import { Button } from '@/components/ui/Button';
import { Field } from '@/components/forms/Field';
import { TextInput } from '@/components/forms/TextInput';
import { useAuth } from '@/hooks/useAuth';
import { loginSchema, type LoginSchema } from '@/schemas/auth';
import { yupResolver } from '@hookform/resolvers/yup';
import { ENV } from '@/config/env';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';

export function LoginPage() {
  const { user, signIn, signInWithOtp, signInWithOAuth } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/';
  const [challengeToken, setChallengeToken] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<LoginSchema>({
    resolver: yupResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const otpForm = useForm<{ otp: string }>({
    defaultValues: { otp: '' },
  });

  if (user && (user.role === 'talent' || user.role === 'guest')) {
    return <Navigate to={from} replace />;
  }

  async function onSubmit(values: LoginSchema) {
    setFormError(null);
    setSubmitting(true);
    try {
      const result = await signIn(values.email, values.password);
      if (!result.ok) {
        if (result.reason === 'two_factor_required' && result.challengeToken) {
          setChallengeToken(result.challengeToken);
          return;
        }
        if (result.reason === 'access_denied') {
          navigate('/access-denied', { replace: true });
          return;
        }
        setFormError(result.message ?? t('errors.validation'));
        return;
      }
      navigate(result.redirectTo, { replace: true });
    } finally {
      setSubmitting(false);
    }
  }

  async function onOtpSubmit() {
    const otp = otpForm.getValues('otp').trim();
    if (!otp) {
      otpForm.setError('otp', { message: t('errors.validation') });
      return;
    }
    setFormError(null);
    setSubmitting(true);
    try {
      const { email, password } = getValues();
      const result = await signInWithOtp({ email, password, otp });
      if (!result.ok) {
        setFormError(result.message ?? t('errors.validation'));
        return;
      }
      navigate(result.redirectTo, { replace: true });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-3xl border border-ink-10 bg-white p-8 shadow-card-lg">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-40">Talent Dashboard</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink">{t('auth.loginTitle')}</h1>

      {challengeToken ? (
        <form
          className="mt-8 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            void onOtpSubmit();
          }}
        >
          <p className="rounded-xl bg-indigo/10 px-4 py-3 text-[13px] font-medium text-ink">
            Two-factor authentication is required.
          </p>
          <Field label="Verification code" error={otpForm.formState.errors.otp?.message}>
            <TextInput
              {...otpForm.register('otp')}
              autoComplete="one-time-code"
              inputMode="numeric"
              autoFocus
            />
          </Field>
          {formError ? <p className="text-[12px] font-medium text-coral">{formError}</p> : null}
          <Button type="submit" variant="dark" className="w-full" size="lg" loading={submitting}>
            {t('auth.signIn')}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            size="sm"
            onClick={() => {
              setChallengeToken(null);
              setFormError(null);
            }}
          >
            {t('common.back')}
          </Button>
        </form>
      ) : (
        <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <Field label={t('auth.email')} error={errors.email?.message}>
            <TextInput
              {...register('email')}
              type="email"
              autoComplete="email"
              hasError={Boolean(errors.email)}
              dir="ltr"
            />
          </Field>
          <Field label={t('auth.password')} error={errors.password?.message}>
            <TextInput
              {...register('password')}
              type="password"
              autoComplete="current-password"
              hasError={Boolean(errors.password)}
              dir="ltr"
            />
          </Field>
          {formError ? <p className="text-[12px] font-medium text-coral">{formError}</p> : null}
          <Button type="submit" variant="dark" className="w-full" size="lg" loading={submitting}>
            {t('auth.signIn')}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            size="md"
            onClick={() => void signInWithOAuth('google')}
          >
            {t('auth.signInGoogle')}
          </Button>
        </form>
      )}

      <div className="mt-6 flex flex-wrap justify-between gap-2 text-[13px] font-semibold">
        <Link to="/forgot-password" className="text-coral hover:underline">
          {t('auth.forgotPassword')}
        </Link>
        <a href={ENV.mainWebsiteUrl} className="text-ink-60 hover:text-coral hover:underline" rel="noreferrer">
          {t('auth.backToMain')}
        </a>
      </div>
    </div>
  );
}
