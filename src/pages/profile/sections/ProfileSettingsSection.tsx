import { Button } from '@/components/ui/Button';
import { Field } from '@/components/forms/Field';
import { Select } from '@/components/forms/Select';
import { useGetPreferencesQuery, useUpdatePreferencesMutation } from '@/api/endpoints';
import { readApiErrorMessage } from '@/lib/apiErrors';
import { updatePreferencesSchema, type UpdatePreferencesSchema } from '@/schemas/profile';
import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

export function ProfileSettingsSection() {
  const { t } = useTranslation();
  const { data: preferences } = useGetPreferencesQuery();
  const [updatePreferences, { isLoading }] = useUpdatePreferencesMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdatePreferencesSchema>({
    resolver: yupResolver(updatePreferencesSchema) as never,
    defaultValues: {
      language: 'en',
      theme: 'system',
      email_notifications: true,
      push_notifications: true,
      sms_notifications: false,
      marketing_emails: false,
    },
  });

  useEffect(() => {
    if (!preferences) return;
    reset({
      language: preferences.language,
      theme: preferences.theme,
      email_notifications: preferences.email_notifications,
      push_notifications: preferences.push_notifications,
      sms_notifications: preferences.sms_notifications,
      marketing_emails: preferences.marketing_emails,
    });
  }, [preferences, reset]);

  async function onSubmit(values: UpdatePreferencesSchema) {
    try {
      await updatePreferences({
        language: values.language ?? undefined,
        theme: values.theme ?? undefined,
        email_notifications: values.email_notifications ?? undefined,
        push_notifications: values.push_notifications ?? undefined,
        sms_notifications: values.sms_notifications ?? undefined,
        marketing_emails: values.marketing_emails ?? undefined,
      }).unwrap();
      toast.success(t('common.saved'));
    } catch (err) {
      toast.error(readApiErrorMessage(err, t('common.error')));
    }
  }

  return (
    <form className="space-y-4 rounded-3xl border border-ink-10 bg-white p-6 shadow-card-sm" onSubmit={handleSubmit(onSubmit)}>
      <h2 className="text-[16px] font-bold text-ink">{t('profile.settingsTitle')}</h2>
      <p className="text-[13px] text-ink-60">{t('profile.settingsHint')}</p>

      <Field label={t('profile.language')} error={errors.language?.message}>
        <Select {...register('language')}>
          <option value="en">English</option>
          <option value="ar">العربية</option>
        </Select>
      </Field>

      <Field label={t('profile.theme')} error={errors.theme?.message}>
        <Select {...register('theme')}>
          <option value="system">{t('profile.themeSystem')}</option>
          <option value="light">{t('profile.themeLight')}</option>
          <option value="dark">{t('profile.themeDark')}</option>
        </Select>
      </Field>

      <div className="space-y-3 rounded-2xl border border-ink-10 bg-ink-5/30 p-4">
        <p className="text-[13px] font-semibold text-ink">{t('profile.notifications')}</p>
        {(
          [
            ['email_notifications', t('profile.emailNotifications')],
            ['push_notifications', t('profile.pushNotifications')],
            ['sms_notifications', t('profile.smsNotifications')],
            ['marketing_emails', t('profile.marketingEmails')],
          ] as const
        ).map(([name, label]) => (
          <label key={name} className="flex items-center gap-2 text-[14px] font-medium text-ink">
            <input type="checkbox" {...register(name)} className="rounded border-ink-20" />
            {label}
          </label>
        ))}
      </div>

      <Button type="submit" variant="dark" loading={isLoading}>
        {t('profile.saveChanges')}
      </Button>
    </form>
  );
}
