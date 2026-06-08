import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { authErrorMessage } from '@/lib/authErrors';
import { OAUTH_REDIRECT_KEY } from '@/lib/oauth';
import { getSafeRedirectPath } from '@/lib/navigation';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';

export function OAuthCallbackPage() {
  const { provider } = useParams<{ provider: string }>();
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const providerError = searchParams.get('error') ?? searchParams.get('error_description');
  const { completeOAuthCallback } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const ranRef = useRef(false);

  const [error, setError] = useState<string | null>(() => {
    if (providerError) return decodeURIComponent(providerError);
    if (!provider || !code) {
      return 'Missing authorization code from the provider. Please try signing in again.';
    }
    return null;
  });

  useEffect(() => {
    if (ranRef.current) return;
    if (error) {
      ranRef.current = true;
      return;
    }
    if (!provider || !code) return;
    ranRef.current = true;

    completeOAuthCallback(provider, code, state)
      .then((redirectTo) => {
        const stored = sessionStorage.getItem(OAUTH_REDIRECT_KEY);
        sessionStorage.removeItem(OAUTH_REDIRECT_KEY);
        const safe = getSafeRedirectPath(stored) ?? redirectTo ?? '/';
        navigate(safe, { replace: true });
      })
      .catch((e) => {
        setError(authErrorMessage(e, 'We could not finish signing you in.'));
      });
  }, [code, completeOAuthCallback, error, navigate, provider, state]);

  return (
    <div className="mx-auto w-full max-w-md rounded-3xl border border-ink-10 bg-white p-8 shadow-card-lg">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-40">
        {t('auth.signIn')}
      </p>
      <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-ink">
        {error ? 'Sign-in failed' : `Finishing ${provider ?? 'OAuth'} sign-in…`}
      </h1>
      <p className="mt-2 text-[14px] text-ink-60">
        {error ? 'Please try again or use email and password.' : 'Verifying your authorization with the provider.'}
      </p>

      {error ? (
        <div className="mt-6 space-y-3">
          <p className="rounded-xl border border-coral/30 bg-coral/10 px-4 py-3 text-[13px] font-medium text-coral">
            {error}
          </p>
          <Link to="/login">
            <Button type="button" variant="dark" className="w-full">
              {t('auth.signIn')}
            </Button>
          </Link>
        </div>
      ) : (
        <div className="mt-8 flex justify-center py-4">
          <div
            className="h-10 w-10 animate-spin rounded-full border-2 border-ink-10 border-t-coral"
            aria-label={t('common.loading')}
          />
        </div>
      )}
    </div>
  );
}
