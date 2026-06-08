import { RequireApprovedTalent } from '@/components/auth/RequireApprovedTalent';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { RequireTalentCandidate } from '@/components/auth/RequireTalentCandidate';
import { PreferencesLanguageSync } from '@/components/i18n/PreferencesLanguageSync';
import { PageSkeleton } from '@/components/ui/PageSkeleton';
import { AuthProvider } from '@/contexts/AuthContext';
import { AppToaster } from '@/lib/AppToaster';
import { ApplicationLayout } from '@/layouts/ApplicationLayout';
import { PublicAuthLayout } from '@/layouts/PublicAuthLayout';
import { TalentShellLayout } from '@/layouts/TalentShellLayout';
import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

const AccessDeniedPage = lazy(() =>
  import('@/pages/auth/AccessDeniedPage').then((m) => ({ default: m.AccessDeniedPage })),
);
const ForgotPasswordPage = lazy(() =>
  import('@/pages/auth/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })),
);
const LoginPage = lazy(() => import('@/pages/auth/LoginPage').then((m) => ({ default: m.LoginPage })));
const OAuthCallbackPage = lazy(() =>
  import('@/pages/auth/OAuthCallbackPage').then((m) => ({ default: m.OAuthCallbackPage })),
);
const ResetPasswordPage = lazy(() =>
  import('@/pages/auth/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage })),
);
const ApplicationStatusPage = lazy(() =>
  import('@/pages/application/ApplicationStatusPage').then((m) => ({
    default: m.ApplicationStatusPage,
  })),
);
const ApplicationWizardPage = lazy(() =>
  import('@/pages/application/ApplicationWizardPage').then((m) => ({
    default: m.ApplicationWizardPage,
  })),
);
const HomePage = lazy(() => import('@/pages/dashboard/HomePage').then((m) => ({ default: m.HomePage })));
const EngagementDetailPage = lazy(() =>
  import('@/pages/engagements/EngagementDetailPage').then((m) => ({
    default: m.EngagementDetailPage,
  })),
);
const EngagementsPage = lazy(() =>
  import('@/pages/engagements/EngagementsPage').then((m) => ({ default: m.EngagementsPage })),
);
const AvailabilityPage = lazy(() =>
  import('@/pages/profile/AvailabilityPage').then((m) => ({ default: m.AvailabilityPage })),
);
const ProfilePage = lazy(() =>
  import('@/pages/profile/ProfilePage').then((m) => ({ default: m.ProfilePage })),
);
const PublicProfilePreviewPage = lazy(() =>
  import('@/pages/profile/PublicProfilePreviewPage').then((m) => ({
    default: m.PublicProfilePreviewPage,
  })),
);
const RatingsPage = lazy(() =>
  import('@/pages/ratings/RatingsPage').then((m) => ({ default: m.RatingsPage })),
);

function RouteFallback() {
  return <PageSkeleton />;
}

export function App() {
  return (
    <AuthProvider>
      <PreferencesLanguageSync />
      <AppToaster />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route element={<PublicAuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/auth/oauth/:provider/callback" element={<OAuthCallbackPage />} />
            <Route path="/access-denied" element={<AccessDeniedPage />} />
          </Route>

          <Route element={<RequireAuth />}>
            <Route element={<RequireTalentCandidate />}>
              <Route element={<ApplicationLayout />}>
                <Route path="/application" element={<ApplicationWizardPage />} />
                <Route path="/application/status" element={<ApplicationStatusPage />} />
              </Route>
            </Route>
          </Route>

          <Route element={<RequireAuth />}>
            <Route element={<RequireApprovedTalent />}>
              <Route element={<TalentShellLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/availability" element={<AvailabilityPage />} />
                <Route path="/engagements" element={<EngagementsPage />} />
                <Route path="/engagements/:id" element={<EngagementDetailPage />} />
                <Route path="/ratings" element={<RatingsPage />} />
                <Route path="/preview" element={<PublicProfilePreviewPage />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}
