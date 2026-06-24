import { Button } from '@/components/ui/Button';
import { Field } from '@/components/forms/Field';
import { TextInput } from '@/components/forms/TextInput';
import { useAuth } from '@/hooks/useAuth';
import { useLocalizedYupResolver } from '@/hooks/useLocalizedYupResolver';
import { useRevalidateFormOnLanguageChange } from '@/hooks/useRevalidateFormOnLanguageChange';
import { useRefreshGenericErrorOnLanguageChange } from '@/hooks/useRefreshGenericErrorOnLanguageChange';
import { buildLoginSchema, buildOtpSchema, type LoginSchema, type OtpSchema } from '@/schemas/auth';
import { ENV } from '@/config/env';
import { useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';

export function LoginPage() {
  const { user, signIn, signInWithOtp, signInWithOAuth } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/';
  const [challengeToken, setChallengeToken] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const formErrorIsGenericRef = useRef(false);
  const [submitting, setSubmitting] = useState(false);

  const loginSchema = useMemo(() => buildLoginSchema(t), [t, i18n.language]);
  const otpSchema = useMemo(() => buildOtpSchema(t), [t, i18n.language]);
  const loginResolver = useLocalizedYupResolver(loginSchema);
  const otpResolver = useLocalizedYupResolver(otpSchema);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    trigger,
  } = useForm<LoginSchema>({
    resolver: loginResolver as never,
    defaultValues: { email: '', password: '' },
  });

  const otpForm = useForm<OtpSchema>({
    resolver: otpResolver as never,
    defaultValues: { otp: '' },
  });

  useRevalidateFormOnLanguageChange(trigger);
  useRevalidateFormOnLanguageChange(otpForm.trigger);
  useRefreshGenericErrorOnLanguageChange(formError, setFormError, formErrorIsGenericRef, 'errors.validation');

  function setClientFormError(message: string) {
    formErrorIsGenericRef.current = true;
    setFormError(message);
  }

  function setApiFormError(message: string) {
    formErrorIsGenericRef.current = false;
    setFormError(message);
  }

  if (user?.role === 'talent') {
    return <Navigate to={from} replace />;
  }

  async function onSubmit(values: LoginSchema) {
    setFormError(null);
    formErrorIsGenericRef.current = false;
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
        if (result.message) {
          setApiFormError(result.message);
        } else {
          setClientFormError(t('errors.validation'));
        }
        return;
      }
      navigate(result.redirectTo, { replace: true });
    } finally {
      setSubmitting(false);
    }
  }

  async function onOtpSubmit(values: OtpSchema) {
    setFormError(null);
    formErrorIsGenericRef.current = false;
    setSubmitting(true);
    try {
      const { email, password } = getValues();
      const result = await signInWithOtp({ email, password, otp: values.otp });
      if (!result.ok) {
        if (result.reason === 'access_denied') {
          navigate('/access-denied', { replace: true });
          return;
        }
        if (result.message) {
          setApiFormError(result.message);
        } else {
          setClientFormError(t('errors.validation'));
        }
        return;
      }
      navigate(result.redirectTo, { replace: true });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-ink-10 bg-white p-8 shadow-elevated">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-40">{t('brand.dashboard')}</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink">{t('auth.loginTitle')}</h1>

      {challengeToken ? (
        <form className="mt-8 space-y-4" onSubmit={otpForm.handleSubmit(onOtpSubmit)}>
          <p className="rounded-xl bg-indigo/10 px-4 py-3 text-[13px] font-medium text-ink">
            {t('auth.twoFactorRequired')}
          </p>
          <Field label={t('auth.verificationCode')} error={otpForm.formState.errors.otp?.message}>
            <TextInput
              {...otpForm.register('otp')}
              autoComplete="one-time-code"
              inputMode="numeric"
              autoFocus
              hasError={Boolean(otpForm.formState.errors.otp)}
              dir="ltr"
            />
          </Field>
          {formError ? <p className="text-[12px] font-medium text-coral">{formError}</p> : null}
          <Button type="submit" variant="primary" className="w-full" size="lg" loading={submitting}>
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
              formErrorIsGenericRef.current = false;
              otpForm.reset({ otp: '' });
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
          <Button type="submit" variant="primary" className="w-full" size="lg" loading={submitting}>
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
