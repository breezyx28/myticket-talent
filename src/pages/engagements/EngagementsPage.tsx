import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { StatusPill } from '@/components/talent/StatusPill';
import {
  appendConversationMessageIfNew,
  useAcceptEngagementMutation,
  useCompleteEngagementMutation,
  useDeclineEngagementMutation,
  useGetConversationQuery,
  useListConversationMessagesQuery,
  useListConversationsQuery,
  useListEngagementsQuery,
  useMarkConversationReadMutation,
  usePostConversationMessageMutation,
} from '@/api/endpoints';
import type { Conversation, ConversationMessage } from '@/api/types/conversation';
import type { Engagement } from '@/api/types/engagement';
import type { ListConversationsQuery } from '@/api/types/conversation';
import { readApiErrorMessage } from '@/lib/apiErrors';
import {
  filterConversationsByEngagementStatus,
  getEngagementForConversation,
  getEngagementStatusForConversation,
  getOrganizerDisplayName,
} from '@/lib/conversationEngagement';
import { ENGAGEMENT_STATUS_FILTERS } from '@/lib/engagementsUi';
import { leaveConversation, subscribeConversation } from '@/lib/realtime/channels';
import type { MessagePayload } from '@/lib/realtime/types';
import { buildEngagementMessageSchema, buildDeclineEngagementSchema } from '@/schemas/engagement';
import { isValidationError, useLocalizedActionError } from '@/hooks/useLocalizedActionError';
import { formatDateTime } from '@/lib/formatDate';
import { cn } from '@/lib/utils';
import type { EngagementStatus } from '@/types/domain';
import { useAppDispatch } from '@/store/hooks';
import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';

const LIST_QUERY: ListConversationsQuery = { page: 1, per_page: 50 };
const ENGAGEMENTS_QUERY = { page: 1, per_page: 50 };

export function EngagementsPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const focusId = searchParams.get('focus');

  const [statusFilter, setStatusFilter] = useState<'all' | EngagementStatus>('all');

  const { data: conversationsPaged, isLoading, isError } = useListConversationsQuery(LIST_QUERY);
  const { data: engagementsPaged } = useListEngagementsQuery(ENGAGEMENTS_QUERY);
  const engagements = useMemo(() => engagementsPaged?.data ?? [], [engagementsPaged?.data]);

  const list = useMemo(() => {
    const conversations = conversationsPaged?.data ?? [];
    return filterConversationsByEngagementStatus(conversations, engagements, statusFilter);
  }, [conversationsPaged?.data, engagements, statusFilter]);

  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const effectiveSelectedId = focusId ?? selectedId;
  const [message, setMessage] = useState('');
  const [declineReason, setDeclineReason] = useState('');
  const { error: actionError, clearError, setApiError, setValidationError } = useLocalizedActionError();

  const selected = useMemo(
    () => list.find((c) => String(c.id) === String(effectiveSelectedId)) ?? null,
    [list, effectiveSelectedId],
  );

  const selectedEngagement = useMemo(
    () => (selected ? getEngagementForConversation(selected, engagements) : null),
    [selected, engagements],
  );

  const [acceptEngagement, { isLoading: accepting }] = useAcceptEngagementMutation();
  const [declineEngagement, { isLoading: declining }] = useDeclineEngagementMutation();
  const [postMessage, { isLoading: posting }] = usePostConversationMessageMutation();
  const [completeEngagement, { isLoading: completing }] = useCompleteEngagementMutation();

  async function onAccept(engagementId: string | number) {
    clearError();
    try {
      await acceptEngagement({ id: engagementId }).unwrap();
    } catch (err) {
      setApiError(readApiErrorMessage(err, t('common.error')));
    }
  }

  async function onDecline(engagementId: string | number) {
    clearError();
    try {
      const validated = await buildDeclineEngagementSchema(t).validate({
        reason: declineReason.trim() || undefined,
      });
      await declineEngagement({
        id: engagementId,
        body: { reason: validated.reason ?? undefined },
      }).unwrap();
      setDeclineReason('');
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

  async function onSendMessage(conversationId: string | number) {
    clearError();
    try {
      const validated = await buildEngagementMessageSchema(t).validate({ body: message });
      await postMessage({
        id: conversationId,
        body: { body: validated.body, attachment_url: validated.attachment_url ?? undefined },
        listQuery: LIST_QUERY,
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

  async function onComplete(engagementId: string | number) {
    clearError();
    try {
      await completeEngagement({ id: engagementId }).unwrap();
    } catch (err) {
      setApiError(readApiErrorMessage(err, t('common.error')));
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t('engagements.title')} />
      {actionError ? (
        <p className="rounded-xl border border-coral/30 bg-coral/10 px-4 py-3 text-[13px] font-medium text-coral">
          {actionError}
        </p>
      ) : null}
      <div className="flex gap-1 border-b border-ink-10">
        {ENGAGEMENT_STATUS_FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => setStatusFilter(filter.value)}
            className={cn(
              'relative px-4 py-2.5 text-[13px] font-semibold transition-colors',
              statusFilter === filter.value ? 'text-ink' : 'text-ink-40 hover:text-ink-60',
            )}
          >
            {t(filter.labelKey as 'engagements.filterAll')}
            {statusFilter === filter.value ? (
              <motion.span
                layoutId="engagement-filter-underline"
                className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-coral"
              />
            ) : null}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,360px)_1fr]">
        <aside className="p-1">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : isError ? (
            <p className="text-[13px] font-medium text-coral">{t('common.error')}</p>
          ) : list.length === 0 ? (
            <EmptyState icon={MessageSquare} title={t('engagements.empty')} />
          ) : (
            <ul className="space-y-1">
              {list.map((c) => {
                const status = getEngagementStatusForConversation(c, engagements);
                const organizerName = getOrganizerDisplayName(c, t('engagements.organizer'));
                const preview = c.metadata?.brief ?? c.subject;
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedId(c.id);
                        if (window.innerWidth < 1024) navigate(`/engagements/${c.id}`);
                      }}
                      className={cn(
                        'relative w-full rounded-xl p-3 text-start transition-colors',
                        String(effectiveSelectedId) === String(c.id)
                          ? 'bg-coral/5 ring-1 ring-coral/30'
                          : 'hover:bg-ink-5/50',
                      )}
                    >
                      {String(effectiveSelectedId) === String(c.id) ? (
                        <motion.span
                          layoutId="engagement-selected"
                          className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-coral/20"
                          transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                        />
                      ) : null}
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-bold text-ink">
                          {organizerName !== t('engagements.organizer') ? organizerName : c.subject}
                        </p>
                        <div className="flex shrink-0 items-center gap-1.5">
                          {c.unread ? (
                            <span className="h-2 w-2 rounded-full bg-coral" aria-label={t('engagements.unread')} />
                          ) : null}
                          {status ? (
                            <StatusPill
                              status={status}
                              label={t(`engagements.status_${status}` as 'engagements.status_pending')}
                            />
                          ) : null}
                        </div>
                      </div>
                      <p className="mt-1 line-clamp-2 text-[12px] text-ink-60">{preview}</p>
                      {c.last_message_at ? (
                        <p className="mt-2 text-[11px] text-ink-40" dir="ltr">
                          {formatDateTime(c.last_message_at, i18n.language)}
                        </p>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>

        <section className="hidden lg:block">
          {selected ? (
            <ConversationThread
              conversationId={selected.id}
              conversation={selected}
              engagement={selectedEngagement}
              message={message}
              setMessage={setMessage}
              declineReason={declineReason}
              setDeclineReason={setDeclineReason}
              onAccept={() => selectedEngagement && void onAccept(selectedEngagement.id)}
              onDecline={() => selectedEngagement && void onDecline(selectedEngagement.id)}
              onSendMessage={() => void onSendMessage(selected.id)}
              onComplete={() => selectedEngagement && void onComplete(selectedEngagement.id)}
              accepting={accepting}
              declining={declining}
              posting={posting}
              completing={completing}
            />
          ) : isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : (
            <EmptyState icon={MessageSquare} title={t('engagements.selectThread')} />
          )}
        </section>
      </div>
    </div>
  );
}

function payloadToMessage(payload: MessagePayload): ConversationMessage {
  return {
    id: payload.id,
    conversation_id: payload.conversation_id,
    sender_user_id: payload.sender_user_id,
    sender_role: payload.sender_role,
    body: payload.body,
    attachment_url: payload.attachment_url,
    read_at: payload.read_at,
    created_at: payload.created_at ?? new Date().toISOString(),
  };
}

export function ConversationThread({
  conversationId,
  conversation: conversationProp,
  engagement,
  message,
  setMessage,
  declineReason,
  setDeclineReason,
  onAccept,
  onDecline,
  onSendMessage,
  onComplete,
  accepting,
  declining,
  posting,
  completing,
}: {
  conversationId: string | number;
  conversation?: Conversation;
  engagement: Engagement | null;
  message: string;
  setMessage: (v: string) => void;
  declineReason: string;
  setDeclineReason: (v: string) => void;
  onAccept: () => void;
  onDecline: () => void;
  onSendMessage: () => void;
  onComplete: () => void;
  accepting: boolean;
  declining: boolean;
  posting: boolean;
  completing: boolean;
}) {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const markedReadRef = useRef(false);

  const { data: fetchedConversation } = useGetConversationQuery(
    { id: conversationId },
    { skip: conversationProp != null },
  );
  const conversation = conversationProp ?? fetchedConversation;

  const {
    data: messages = [],
    isLoading: messagesLoading,
    isFetching: messagesFetching,
  } = useListConversationMessagesQuery({ id: conversationId });

  const [markRead] = useMarkConversationReadMutation();

  useEffect(() => {
    markedReadRef.current = false;
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId || markedReadRef.current) return;
    markedReadRef.current = true;
    void markRead({ id: conversationId });
  }, [conversationId, markRead]);

  useEffect(() => {
    const id = Number(conversationId);
    if (!Number.isFinite(id)) return;

    subscribeConversation(id, (payload) => {
      appendConversationMessageIfNew(dispatch, conversationId, payloadToMessage(payload));
    });

    return () => leaveConversation();
  }, [conversationId, dispatch]);

  const organizerName = conversation
    ? getOrganizerDisplayName(conversation, t('engagements.organizer'))
    : t('engagements.organizer');
  const brief = conversation?.metadata?.brief ?? engagement?.preview;
  const engagementStatus = engagement?.status;
  const canCompose = conversation?.status === 'open';
  const emptyLabel = t('common.empty');

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-ink">{conversation?.subject ?? emptyLabel}</h2>
          <p className="mt-1 text-[13px] text-ink-40">
            {organizerName} ·{' '}
            <span dir="ltr">
              {conversation?.created_at
                ? formatDateTime(conversation.created_at, i18n.language)
                : emptyLabel}
            </span>
          </p>
        </div>
        {engagementStatus ? (
          <StatusPill
            status={engagementStatus}
            label={t(`engagements.status_${engagementStatus}` as 'engagements.status_pending')}
          />
        ) : null}
      </div>

      {brief ? (
        <p className="mt-4 rounded-xl border border-ink-10 bg-ink-5/50 px-4 py-3 text-[14px] leading-relaxed text-ink-60">
          {brief}
        </p>
      ) : null}

      <div className="mt-5 rounded-xl border border-ink-10 bg-ink-5/30 p-4">
        <ul className="max-h-[280px] space-y-2 overflow-y-auto pe-1">
          {messagesLoading && messages.length === 0 ? (
            <li className="rounded-xl border border-dashed border-ink-20 bg-white px-3 py-6 text-center text-[12px] text-ink-40">
              {t('engagements.loadingMessages')}
            </li>
          ) : messages.length === 0 ? (
            <li className="rounded-xl border border-dashed border-ink-20 bg-white px-3 py-6 text-center text-[12px] text-ink-40">
              {emptyLabel}
            </li>
          ) : (
            messages.map((msg) => (
              <li
                key={msg.id}
                className={cn(
                  'rounded-xl px-3 py-2 text-[12px]',
                  msg.sender_role === 'talent'
                    ? 'ms-8 bg-ink text-white'
                    : 'me-8 border border-ink-10 bg-white text-ink-60',
                )}
              >
                <p>{msg.body}</p>
                {msg.attachment_url ? (
                  <a
                    href={msg.attachment_url}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(
                      'mt-1 inline-block text-[11px] underline',
                      msg.sender_role === 'talent' ? 'text-white/80' : 'text-coral',
                    )}
                  >
                    {t('engagements.viewAttachment')}
                  </a>
                ) : null}
                <p
                  className={cn(
                    'mt-1 text-[10px]',
                    msg.sender_role === 'talent' ? 'text-white/70' : 'text-ink-40',
                  )}
                  dir="ltr"
                >
                  {formatDateTime(msg.created_at, i18n.language)}
                </p>
              </li>
            ))
          )}
        </ul>
        {messagesFetching && messages.length > 0 ? (
          <p className="mt-2 text-center text-[11px] text-ink-40">{t('common.loading')}</p>
        ) : null}
        {canCompose ? (
          <div
            className="sticky bottom-0 mt-3 flex gap-2 border-t border-ink-10 bg-white pt-3"
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
          >
            <input
              value={message}
              disabled={posting}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t('engagements.messagePlaceholder')}
              className="w-full rounded-xl border border-ink-10 bg-white px-4 py-2.5 text-[13px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
            />
            <Button variant="primary" disabled={posting || !message.trim()} onClick={onSendMessage}>
              {posting ? t('common.saving') : t('engagements.sendMessage')}
            </Button>
          </div>
        ) : null}
      </div>

      {engagementStatus === 'pending' ? (
        <div className="mt-6 space-y-3">
          <input
            value={declineReason}
            onChange={(e) => setDeclineReason(e.target.value)}
            placeholder={t('engagements.declineReason')}
            className="w-full rounded-xl border border-ink-10 px-4 py-2.5 text-[13px]"
          />
          <div className="flex flex-wrap gap-3">
            <Button variant="primary" loading={accepting} disabled={declining} onClick={onAccept}>
              {t('engagements.accept')}
            </Button>
            <Button variant="outline" loading={declining} disabled={accepting} onClick={onDecline}>
              {t('engagements.decline')}
            </Button>
          </div>
        </div>
      ) : null}

      {engagementStatus === 'accepted' ? (
        <Button className="mt-6" variant="secondary" loading={completing} onClick={onComplete}>
          {t('engagements.complete')}
        </Button>
      ) : null}
    </>
  );
}

/** @deprecated Use ConversationThread */
export const EngagementThread = ConversationThread;
