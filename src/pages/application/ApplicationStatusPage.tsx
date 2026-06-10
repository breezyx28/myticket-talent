import { Button } from '@/components/ui/Button';
import { ApplicationStatusBanner } from '@/components/talent/ApplicationStatusBanner';
import {
  useGetMyRoleApplicationsQuery,
  useGetRoleApplicationQuery,
  useGetTalentProfileQuery,
  useResubmitTalentApplicationMutation,
  useWithdrawTalentApplicationMutation,
} from '@/api/endpoints';
import { readApiErrorMessage } from '@/lib/apiErrors';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export function ApplicationStatusPage() {
  const { t } = useTranslation();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { data: myApps } = useGetMyRoleApplicationsQuery();
  const application = myApps?.talent;

  const applicationId = application?.id;
  const { data: detail } = useGetRoleApplicationQuery(
    { role: 'talent', id: applicationId ?? '' },
    {
      skip: applicationId == null,
      pollingInterval: application?.status === 'submitted' ? 30_000 : 0,
    },
  );

  const isApproved = application?.status === 'approved';
  const { data: profile } = useGetTalentProfileQuery(undefined, {
    skip: !isApproved,
    pollingInterval: isApproved ? 10_000 : 0,
  });

  const [resubmit, { isLoading: resubmitting }] = useResubmitTalentApplicationMutation();
  const [withdraw, { isLoading: withdrawing }] = useWithdrawTalentApplicationMutation();

  if (!application) {
    return <Navigate to="/application" replace />;
  }

  if (application.status === 'draft' || application.status === 'not_started') {
    return <Navigate to="/application" replace />;
  }

  if (application.status === 'approved' && profile) {
    return <Navigate to="/" replace />;
  }

  const status = detail?.status ?? application.status;
  const rejectionReason = detail?.rejection_reason ?? application.rejection_reason;

  async function onResubmit() {
    if (!application?.id) return;
    try {
      await resubmit({ id: application.id }).unwrap();
      toast.success(t('application.resubmit'));
      navigate('/application/status', { replace: true });
    } catch (err) {
      toast.error(readApiErrorMessage(err, t('common.error')));
    }
  }

  async function onWithdraw() {
    if (!application?.id) return;
    try {
      await withdraw({ id: application.id }).unwrap();
      toast.success(t('application.withdraw'));
      navigate('/application', { replace: true });
    } catch (err) {
      toast.error(readApiErrorMessage(err, t('common.error')));
    }
  }

  return (
    <div className="space-y-6">
      <ApplicationStatusBanner status={status} />

      {status === 'submitted' ? (
        <p className="rounded-2xl border border-sky/30 bg-sky/10 px-5 py-4 text-[14px] text-ink-60">
          {t('application.status_submitted')}
        </p>
      ) : null}

      {status === 'rejected' ? (
        <div className="rounded-2xl border border-coral/30 bg-coral/10 p-5">
          <p className="text-[14px] font-semibold text-ink">{t('application.status_rejected')}</p>
          {rejectionReason ? (
            <p className="mt-2 text-[13px] text-ink-60">{rejectionReason}</p>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-3">
            <Button variant="dark" onClick={() => navigate('/application?step=0')}>
              {t('application.editApplication')}
            </Button>
            <Button variant="primary" loading={resubmitting} onClick={() => void onResubmit()}>
              {t('application.resubmit')}
            </Button>
            <Button variant="outline" loading={withdrawing} onClick={() => void onWithdraw()}>
              {t('application.withdraw')}
            </Button>
          </div>
        </div>
      ) : null}

      {status === 'approved' && !profile ? (
        <div className="flex items-center gap-3 rounded-2xl border border-mint/30 bg-mint/10 px-5 py-4 text-[14px] font-medium text-ink">
          <Loader2 size={18} className="animate-spin text-mint-dark" />
          {t('application.status_provisioning')}
        </div>
      ) : null}

      {status === 'submitted' ? (
        <Button variant="outline" loading={withdrawing} onClick={() => void onWithdraw()}>
          {t('application.withdraw')}
        </Button>
      ) : null}

      <button
        type="button"
        onClick={() => void signOut()}
        className="text-[13px] font-semibold text-coral hover:underline"
      >
        {t('common.signOut')}
      </button>
    </div>
  );
}
