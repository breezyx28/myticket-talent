import { Button } from '@/components/ui/Button';
import { Field } from '@/components/forms/Field';
import { TextInput } from '@/components/forms/TextInput';
import { useForgotPasswordMutation } from '@/api/endpoints';
import { buildForgotPasswordSchema, type ForgotPasswordSchema } from '@/schemas/auth';
import { readApiErrorMessage } from '@/lib/apiErrors';
import { useLocalizedYupResolver } from '@/hooks/useLocalizedYupResolver';
import { useRevalidateFormOnLanguageChange } from '@/hooks/useRevalidateFormOnLanguageChange';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export function ForgotPasswordPage() {
  const { t, i18n } = useTranslation();
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const [sent, setSent] = useState(false);
  const forgotSchema = useMemo(() => buildForgotPasswordSchema(t), [t, i18n.language]);
  const forgotResolver = useLocalizedYupResolver(forgotSchema);

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
  } = useForm<ForgotPasswordSchema>({
    resolver: forgotResolver as never,
    defaultValues: { email: '' },
  });

  useRevalidateFormOnLanguageChange(trigger);

  async function onSubmit(values: ForgotPasswordSchema) {
    try {
      await forgotPassword({ email: values.email.trim() }).unwrap();
      setSent(true);
      toast.success(t('auth.sendResetLink'));
    } catch (err) {
      toast.error(readApiErrorMessage(err, t('common.error')));
    }
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-3xl border border-ink-10 bg-white p-8 shadow-card-lg">
      <h1 className="text-2xl font-extrabold tracking-tight text-ink">{t('auth.forgotPasswordTitle')}</h1>
      <p className="mt-2 text-[14px] text-ink-60">{t('auth.forgotPasswordHint')}</p>

      {sent ? (
        <p className="mt-6 rounded-xl bg-mint/15 px-4 py-3 text-[13px] font-medium text-ink">
          {t('auth.sendResetLink')}
        </p>
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
          <Button type="submit" variant="dark" className="w-full" size="lg" loading={isLoading}>
            {t('auth.sendResetLink')}
          </Button>
        </form>
      )}

      <Link to="/login" className="mt-6 inline-block text-[13px] font-semibold text-coral hover:underline">
        {t('common.back')}
      </Link>
    </div>
  );
}
