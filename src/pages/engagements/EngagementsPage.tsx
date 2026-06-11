import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { StatusPill } from '@/components/talent/StatusPill';
import {
  useAcceptEngagementMutation,
  useCompleteEngagementMutation,
  useDeclineEngagementMutation,
  useListEngagementMessagesQuery,
  useListEngagementsQuery,
  usePostEngagementMessageMutation,
} from '@/api/endpoints';
import { readApiErrorMessage } from '@/lib/apiErrors';
import { ENGAGEMENT_STATUS_FILTERS } from '@/lib/engagementsUi';
import { declineEngagementSchema, engagementMessageSchema } from '@/schemas/engagement';
import { cn } from '@/lib/utils';
import type { Engagement, EngagementMessage } from '@/api/types/engagement';
import type { EngagementStatus } from '@/types/domain';
import type { ListEngagementsQuery } from '@/api/types/common';
import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';

export function EngagementsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const focusId = searchParams.get('focus');

  const [statusFilter, setStatusFilter] = useState<'all' | EngagementStatus>('all');
  const listQuery = useMemo<ListEngagementsQuery>(
    () => ({
      page: 1,
      per_page: 50,
      ...(statusFilter === 'all' ? {} : { status: statusFilter }),
    }),
    [statusFilter],
  );

  const { data: engagementsPaged, isLoading, isError } = useListEngagementsQuery(listQuery);

  const list = useMemo(() => engagementsPaged?.data ?? [], [engagementsPaged?.data]);
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const effectiveSelectedId = focusId ?? selectedId;
  const [message, setMessage] = useState('');
  const [declineReason, setDeclineReason] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  const [acceptEngagement, { isLoading: accepting }] = useAcceptEngagementMutation();
  const [declineEngagement, { isLoading: declining }] = useDeclineEngagementMutation();
  const [postMessage, { isLoading: posting }] = usePostEngagementMessageMutation();
  const [completeEngagement, { isLoading: completing }] = useCompleteEngagementMutation();

  const selected = useMemo(
    () => list.find((e) => String(e.id) === String(effectiveSelectedId)) ?? null,
    [list, effectiveSelectedId],
  );

  const {
    data: threadMessages = [],
    isLoading: messagesLoading,
    isFetching: messagesFetching,
  } = useListEngagementMessagesQuery(
    { id: selected?.id ?? '' },
    { skip: selected == null },
  );

  async function onAccept(id: string | number) {
    setActionError(null);
    try {
      await acceptEngagement({ id, listQuery }).unwrap();
    } catch (err) {
      setActionError(readApiErrorMessage(err, t('common.error')));
    }
  }

  async function onDecline(id: string | number) {
    setActionError(null);
    try {
      const validated = await declineEngagementSchema.validate({
        reason: declineReason.trim() || undefined,
      });
      await declineEngagement({
        id,
        body: { reason: validated.reason ?? undefined },
        listQuery,
      }).unwrap();
      setDeclineReason('');
    } catch (err) {
      setActionError(readApiErrorMessage(err, t('common.error')));
    }
  }

  async function onSendMessage() {
    if (!selected) return;
    setActionError(null);
    try {
      const validated = await engagementMessageSchema.validate({ body: message });
      await postMessage({
        id: selected.id,
        body: { body: validated.body, attachment_url: validated.attachment_url ?? undefined },
        listQuery,
      }).unwrap();
      setMessage('');
    } catch (err) {
      setActionError(err instanceof Error ? err.message : readApiErrorMessage(err, t('common.error')));
    }
  }

  async function onComplete(id: string | number) {
    setActionError(null);
    try {
      await completeEngagement({ id, listQuery }).unwrap();
    } catch (err) {
      setActionError(readApiErrorMessage(err, t('common.error')));
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
              {list.map((e) => (
                <li key={e.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedId(e.id);
                      if (window.innerWidth < 1024) navigate(`/engagements/${e.id}`);
                    }}
                    className={cn(
                      'relative w-full rounded-xl p-3 text-start transition-colors',
                      String(effectiveSelectedId) === String(e.id)
                        ? 'bg-coral/5 ring-1 ring-coral/30'
                        : 'hover:bg-ink-5/50',
                    )}
                  >
                    {String(effectiveSelectedId) === String(e.id) ? (
                      <motion.span
                        layoutId="engagement-selected"
                        className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-coral/20"
                        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                      />
                    ) : null}
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold text-ink">{e.organizer_profile_snapshot?.display_name ?? e.topic}</p>
                      <StatusPill
                        status={e.status}
                        label={t(`engagements.status_${e.status}` as 'engagements.status_pending')}
                      />
                    </div>
                    <p className="mt-1 line-clamp-2 text-[12px] text-ink-60">{e.preview || e.topic}</p>
                    <p className="mt-2 text-[11px] text-ink-40" dir="ltr">
                      {new Date(e.last_message_at).toLocaleString()}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        <section className="hidden lg:block">
          {selected ? (
            <EngagementThread
              engagement={selected}
              messages={threadMessages}
              messagesLoading={messagesLoading || messagesFetching}
              message={message}
              setMessage={setMessage}
              declineReason={declineReason}
              setDeclineReason={setDeclineReason}
              onAccept={() => void onAccept(selected.id)}
              onDecline={() => void onDecline(selected.id)}
              onSendMessage={() => void onSendMessage()}
              onComplete={() => void onComplete(selected.id)}
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

export function EngagementThread({
  engagement,
  messages,
  messagesLoading = false,
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
  engagement: Engagement;
  messages: EngagementMessage[];
  messagesLoading?: boolean;
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
  const { t } = useTranslation();
  const threadMessages = messages.length > 0 ? messages : (engagement.messages ?? []);

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-ink">{engagement.topic}</h2>
          <p className="mt-1 text-[13px] text-ink-40">
            {engagement.organizer_profile_snapshot?.display_name ?? 'Organizer'} ·{' '}
            <span dir="ltr">{new Date(engagement.created_at).toLocaleString()}</span>
          </p>
        </div>
        <StatusPill
          status={engagement.status}
          label={t(`engagements.status_${engagement.status}` as 'engagements.status_pending')}
        />
      </div>

      {engagement.preview ? (
        <p className="mt-4 rounded-xl border border-ink-10 bg-ink-5/50 px-4 py-3 text-[14px] leading-relaxed text-ink-60">
          {engagement.preview}
        </p>
      ) : null}

      <div className="mt-5 rounded-xl border border-ink-10 bg-ink-5/30 p-4">
        <ul className="max-h-[280px] space-y-2 overflow-y-auto pe-1">
          {messagesLoading && threadMessages.length === 0 ? (
            <li className="rounded-xl border border-dashed border-ink-20 bg-white px-3 py-6 text-center text-[12px] text-ink-40">
              {t('engagements.loadingMessages')}
            </li>
          ) : threadMessages.length === 0 ? (
            <li className="rounded-xl border border-dashed border-ink-20 bg-white px-3 py-6 text-center text-[12px] text-ink-40">
              —
            </li>
          ) : (
            threadMessages.map((msg) => (
              <li
                key={msg.id}
                className={cn(
                  'rounded-xl px-3 py-2 text-[12px]',
                  msg.sender === 'talent'
                    ? 'ms-8 bg-ink text-white'
                    : 'me-8 border border-ink-10 bg-white text-ink-60',
                )}
              >
                <p>{msg.body}</p>
                <p
                  className={cn('mt-1 text-[10px]', msg.sender === 'talent' ? 'text-white/70' : 'text-ink-40')}
                  dir="ltr"
                >
                  {new Date(msg.created_at).toLocaleString()}
                </p>
              </li>
            ))
          )}
        </ul>
        {engagement.status === 'accepted' ? (
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

      {engagement.status === 'pending' ? (
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

      {engagement.status === 'accepted' ? (
        <Button className="mt-6" variant="secondary" loading={completing} onClick={onComplete}>
          {t('engagements.complete')}
        </Button>
      ) : null}
    </>
  );
}
