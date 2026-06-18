import { Button } from '@/components/ui/Button';
import { ConversationThread } from '@/pages/engagements/EngagementsPage';
import {
  useAcceptEngagementMutation,
  useCompleteEngagementMutation,
  useDeclineEngagementMutation,
  useGetConversationQuery,
  useListEngagementsQuery,
  usePostConversationMessageMutation,
} from '@/api/endpoints';
import { getEngagementForConversation } from '@/lib/conversationEngagement';
import { readApiErrorMessage } from '@/lib/apiErrors';
import { isValidationError, useLocalizedActionError } from '@/hooks/useLocalizedActionError';
import { buildDeclineEngagementSchema, buildEngagementMessageSchema } from '@/schemas/engagement';
import { ChevronLeft } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';

const ENGAGEMENTS_QUERY = { page: 1, per_page: 50 };

export function EngagementDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { data: conversation, isLoading, isError } = useGetConversationQuery(
    { id: id ?? '' },
    { skip: !id },
  );
  const { data: engagementsPaged } = useListEngagementsQuery(ENGAGEMENTS_QUERY);

  const engagement = useMemo(
    () => (conversation ? getEngagementForConversation(conversation, engagementsPaged?.data ?? []) : null),
    [conversation, engagementsPaged?.data],
  );

  const [message, setMessage] = useState('');
  const [declineReason, setDeclineReason] = useState('');
  const { error: actionError, clearError, setApiError, setValidationError } = useLocalizedActionError();

  const [acceptEngagement, { isLoading: accepting }] = useAcceptEngagementMutation();
  const [declineEngagement, { isLoading: declining }] = useDeclineEngagementMutation();
  const [postMessage, { isLoading: posting }] = usePostConversationMessageMutation();
  const [completeEngagement, { isLoading: completing }] = useCompleteEngagementMutation();

  async function onAccept() {
    if (!engagement) return;
    clearError();
    try {
      await acceptEngagement({ id: engagement.id }).unwrap();
    } catch (err) {
      setApiError(readApiErrorMessage(err, t('common.error')));
    }
  }

  async function onDecline() {
    if (!engagement) return;
    clearError();
    try {
      const validated = await buildDeclineEngagementSchema(t).validate({
        reason: declineReason.trim() || undefined,
      });
      await declineEngagement({
        id: engagement.id,
        body: { reason: validated.reason ?? undefined },
      }).unwrap();
    } catch (err) {
      if (isValidationError(err)) {
        setValidationError(err.message, async () => {
          try {
            await buildDeclineEngagementSchema(t).validate({
              reason: declineReason.trim() || undefined,
            });
            return null;
          } catch (e) {
            return isValidationError(e) ? e.message : null;
          }
        });
        return;
      }
      setApiError(readApiErrorMessage(err, t('common.error')));
    }
  }

  async function onSendMessage() {
    if (!id) return;
    clearError();
    try {
      const validated = await buildEngagementMessageSchema(t).validate({ body: message });
      await postMessage({
        id,
        body: { body: validated.body, attachment_url: validated.attachment_url ?? undefined },
      }).unwrap();
      setMessage('');
    } catch (err) {
      if (isValidationError(err)) {
        setValidationError(err.message, async () => {
          try {
            await buildEngagementMessageSchema(t).validate({ body: message });
            return null;
          } catch (e) {
            return isValidationError(e) ? e.message : null;
          }
        });
        return;
      }
      setApiError(err instanceof Error ? err.message : readApiErrorMessage(err, t('common.error')));
    }
  }

  async function onComplete() {
    if (!engagement) return;
    clearError();
    try {
      await completeEngagement({ id: engagement.id }).unwrap();
    } catch (err) {
      setApiError(readApiErrorMessage(err, t('common.error')));
    }
  }

  if (isLoading) {
    return <p className="text-[14px] text-ink-60">{t('common.loading')}</p>;
  }

  if (isError || !conversation || !id) {
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
      <Link
        to="/engagements"
        className="inline-flex items-center gap-1 text-[13px] font-semibold text-coral hover:underline"
      >
        <ChevronLeft size={16} className="rtl:rotate-180" aria-hidden />
        {t('common.back')}
      </Link>
      {actionError ? (
        <p className="rounded-xl border border-coral/30 bg-coral/10 px-4 py-3 text-[13px] font-medium text-coral">
          {actionError}
        </p>
      ) : null}
      <div className="rounded-2xl border border-ink-10 bg-white p-5">
        <ConversationThread
          conversationId={id}
          conversation={conversation}
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
