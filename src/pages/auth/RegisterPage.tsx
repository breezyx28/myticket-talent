import { Button } from '@/components/ui/Button';
import { Field } from '@/components/forms/Field';
import { TextInput } from '@/components/forms/TextInput';
import { useAuth } from '@/hooks/useAuth';
import { useLocalizedYupResolver } from '@/hooks/useLocalizedYupResolver';
import { useRevalidateFormOnLanguageChange } from '@/hooks/useRevalidateFormOnLanguageChange';
import { useRefreshGenericErrorOnLanguageChange } from '@/hooks/useRefreshGenericErrorOnLanguageChange';
import { buildRegisterSchema, type RegisterSchema } from '@/schemas/auth';
import { useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link, Navigate, useNavigate } from 'react-router-dom';

export function RegisterPage() {
  const { user, signUp } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string | null>(null);
  const formErrorIsGenericRef = useRef(false);
  const [submitting, setSubmitting] = useState(false);

  const registerSchema = useMemo(() => buildRegisterSchema(t), [t, i18n.language]);
  const registerResolver = useLocalizedYupResolver(registerSchema);

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
  } = useForm<RegisterSchema>({
    resolver: registerResolver as never,
    defaultValues: { full_name: '', email: '', password: '' },
  });

  useRevalidateFormOnLanguageChange(trigger);
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
    return <Navigate to="/" replace />;
  }

  async function onSubmit(values: RegisterSchema) {
    setFormError(null);
    formErrorIsGenericRef.current = false;
    setSubmitting(true);
    try {
      const result = await signUp(values);
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
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink">{t('auth.registerTitle')}</h1>

      <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Field label={t('auth.fullName')} error={errors.full_name?.message}>
          <TextInput
            {...register('full_name')}
            autoComplete="name"
            hasError={Boolean(errors.full_name)}
          />
        </Field>
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
            autoComplete="new-password"
            hasError={Boolean(errors.password)}
            dir="ltr"
          />
        </Field>
        {formError ? <p className="text-[12px] font-medium text-coral">{formError}</p> : null}
        <Button type="submit" variant="primary" className="w-full" size="lg" loading={submitting}>
          {t('auth.register')}
        </Button>
      </form>

      <p className="mt-6 text-center text-[13px] text-ink-60">
        {t('auth.hasAccount')}{' '}
        <Link to="/login" className="font-semibold text-coral hover:underline">
          {t('auth.signIn')}
        </Link>
      </p>
    </div>
  );
}
