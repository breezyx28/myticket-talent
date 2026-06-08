import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { ENV } from '@/config/env';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export function AccessDeniedPage() {
  const { signOut, user } = useAuth();
  const { t } = useTranslation();

  return (
    <div className="mx-auto w-full max-w-lg rounded-3xl border border-white/10 bg-ink p-8 text-white shadow-card-xl">
      <h1 className="text-3xl font-extrabold tracking-tight">{t('auth.accessDeniedTitle')}</h1>
      <p className="mt-3 text-[15px] text-white/80">
        {t('auth.accessDeniedBody')}
        {user?.email ? (
          <>
            {' '}
            (<span className="font-semibold text-white">{user.email}</span>)
          </>
        ) : null}
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button type="button" variant="primary" onClick={() => void signOut()}>
          {t('common.signOut')}
        </Button>
        <a
          href={ENV.mainWebsiteUrl}
          className="inline-flex items-center rounded-full border-2 border-white/30 px-5 py-3 text-[14px] font-semibold hover:bg-white/10"
          rel="noreferrer"
        >
          {t('auth.backToMain')}
        </a>
      </div>
      <Link to="/login" className="mt-6 inline-block text-[13px] font-semibold text-lemon hover:underline">
        {t('auth.signIn')}
      </Link>
    </div>
  );
}
