import { Button } from '@/components/ui/Button';
import { Field } from '@/components/forms/Field';
import { TextInput } from '@/components/forms/TextInput';
import { useResetPasswordMutation } from '@/api/endpoints';
import { resetPasswordSchema, type ResetPasswordSchema } from '@/schemas/auth';
import { readApiErrorMessage } from '@/lib/apiErrors';
import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

export function ResetPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tokenFromQuery = searchParams.get('token') ?? '';
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ResetPasswordSchema>({
    resolver: yupResolver(resetPasswordSchema),
    defaultValues: { token: tokenFromQuery, password: '', password_confirmation: '' },
  });

  useEffect(() => {
    if (tokenFromQuery) setValue('token', tokenFromQuery);
  }, [tokenFromQuery, setValue]);

  async function onSubmit(values: ResetPasswordSchema) {
    try {
      await resetPassword({
        token: values.token.trim(),
        password: values.password,
      }).unwrap();
      toast.success(t('auth.resetPassword'));
      navigate('/login', { replace: true });
    } catch (err) {
      toast.error(readApiErrorMessage(err, t('common.error')));
    }
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-3xl border border-ink-10 bg-white p-8 shadow-card-lg">
      <h1 className="text-2xl font-extrabold tracking-tight text-ink">{t('auth.resetPasswordTitle')}</h1>

      <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        {!tokenFromQuery ? (
          <Field label="Reset token" error={errors.token?.message}>
            <TextInput
              {...register('token')}
              hasError={Boolean(errors.token)}
              dir="ltr"
              autoComplete="off"
            />
          </Field>
        ) : null}
        <Field label={t('auth.password')} error={errors.password?.message}>
          <TextInput
            {...register('password')}
            type="password"
            autoComplete="new-password"
            hasError={Boolean(errors.password)}
            dir="ltr"
          />
        </Field>
        <Field label="Confirm password" error={errors.password_confirmation?.message}>
          <TextInput
            {...register('password_confirmation')}
            type="password"
            autoComplete="new-password"
            hasError={Boolean(errors.password_confirmation)}
            dir="ltr"
          />
        </Field>
        <Button type="submit" variant="dark" className="w-full" size="lg" loading={isLoading}>
          {t('auth.resetPassword')}
        </Button>
      </form>

      <Link to="/login" className="mt-6 inline-block text-[13px] font-semibold text-coral hover:underline">
        {t('common.back')}
      </Link>
    </div>
  );
}
