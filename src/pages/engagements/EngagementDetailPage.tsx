import { Button } from '@/components/ui/Button';
import { EngagementThread } from '@/pages/engagements/EngagementsPage';
import {
  useAcceptEngagementMutation,
  useCompleteEngagementMutation,
  useDeclineEngagementMutation,
  useListEngagementsQuery,
  usePostEngagementMessageMutation,
} from '@/api/endpoints';
import { readApiErrorMessage } from '@/lib/apiErrors';
import { declineEngagementSchema, engagementMessageSchema } from '@/schemas/engagement';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';

export function EngagementDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { data: engagementsPaged, isLoading } = useListEngagementsQuery({ page: 1, per_page: 50 });

  const engagement = useMemo(
    () => (engagementsPaged?.data ?? []).find((e) => String(e.id) === id),
    [engagementsPaged, id],
  );

  const [message, setMessage] = useState('');
  const [declineReason, setDeclineReason] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  const [acceptEngagement, { isLoading: accepting }] = useAcceptEngagementMutation();
  const [declineEngagement, { isLoading: declining }] = useDeclineEngagementMutation();
  const [postMessage, { isLoading: posting }] = usePostEngagementMessageMutation();
  const [completeEngagement, { isLoading: completing }] = useCompleteEngagementMutation();

  async function onAccept() {
    if (!engagement) return;
    setActionError(null);
    try {
      await acceptEngagement({ id: engagement.id }).unwrap();
    } catch (err) {
      setActionError(readApiErrorMessage(err, t('common.error')));
    }
  }

  async function onDecline() {
    if (!engagement) return;
    setActionError(null);
    try {
      const validated = await declineEngagementSchema.validate({
        reason: declineReason.trim() || undefined,
      });
      await declineEngagement({
        id: engagement.id,
        body: { reason: validated.reason ?? undefined },
      }).unwrap();
    } catch (err) {
      setActionError(readApiErrorMessage(err, t('common.error')));
    }
  }

  async function onSendMessage() {
    if (!engagement) return;
    setActionError(null);
    try {
      const validated = await engagementMessageSchema.validate({ body: message });
      await postMessage({
        id: engagement.id,
        body: { body: validated.body, attachment_url: validated.attachment_url ?? undefined },
      }).unwrap();
      setMessage('');
    } catch (err) {
      setActionError(err instanceof Error ? err.message : readApiErrorMessage(err, t('common.error')));
    }
  }

  async function onComplete() {
    if (!engagement) return;
    setActionError(null);
    try {
      await completeEngagement({ id: engagement.id }).unwrap();
    } catch (err) {
      setActionError(readApiErrorMessage(err, t('common.error')));
    }
  }

  if (isLoading) {
    return <p className="text-[14px] text-ink-60">{t('common.loading')}</p>;
  }

  if (!engagement) {
    return (
      <div className="rounded-2xl border border-ink-10 bg-white p-8 text-center">
        <p className="text-[14px] text-ink-60">{t('errors.notFound')}</p>
        <Link to="/engagements" className="mt-4 inline-block">
          <Button variant="outline">{t('common.back')}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:hidden">
      <Link to="/engagements" className="text-[13px] font-semibold text-coral hover:underline">
        ← {t('common.back')}
      </Link>
      {actionError ? (
        <p className="rounded-xl border border-coral/30 bg-coral/10 px-4 py-3 text-[13px] font-medium text-coral">
          {actionError}
        </p>
      ) : null}
      <div className="rounded-2xl border border-ink-10 bg-white p-5">
        <EngagementThread
          engagement={engagement}
          message={message}
          setMessage={setMessage}
          declineReason={declineReason}
          setDeclineReason={setDeclineReason}
          onAccept={() => void onAccept()}
          onDecline={() => void onDecline()}
          onSendMessage={() => void onSendMessage()}
          onComplete={() => void onComplete()}
          accepting={accepting}
          declining={declining}
          posting={posting}
          completing={completing}
        />
      </div>
    </div>
  );
}
