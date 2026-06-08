import { Button } from '@/components/ui/Button';
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
      <div>
        <h1 className="text-[28px] font-extrabold text-ink">{t('engagements.title')}</h1>
        {actionError ? (
          <p className="mt-3 rounded-xl border border-coral/30 bg-coral/10 px-4 py-3 text-[13px] font-medium text-coral">
            {actionError}
          </p>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-2">
          {ENGAGEMENT_STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setStatusFilter(filter.value)}
              className={cn(
                'rounded-full px-4 py-2 text-[12px] font-semibold transition-colors',
                statusFilter === filter.value
                  ? 'bg-ink text-white shadow-card-sm'
                  : 'border border-ink-10 bg-white text-ink-60 hover:bg-ink-5 hover:text-ink',
              )}
            >
              {t(filter.labelKey as 'engagements.filterAll')}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,360px)_1fr]">
        <aside className="rounded-2xl border border-ink-10 bg-white p-4 md:p-5">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-40">
            {t('engagements.title')}
          </p>
          {isLoading ? (
            <p className="text-[13px] text-ink-40">{t('common.loading')}</p>
          ) : isError ? (
            <p className="text-[13px] font-medium text-coral">{t('common.error')}</p>
          ) : list.length === 0 ? (
            <p className="rounded-xl border border-dashed border-ink-20 bg-ink-5/40 px-4 py-8 text-center text-[13px] text-ink-40">
              {t('engagements.empty')}
            </p>
          ) : (
            <ul className="space-y-2">
              {list.map((e) => (
                <li key={e.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedId(e.id);
                      if (window.innerWidth < 1024) navigate(`/engagements/${e.id}`);
                    }}
                    className={cn(
                      'w-full rounded-xl border p-3 text-start transition-colors',
                      String(effectiveSelectedId) === String(e.id)
                        ? 'border-coral bg-coral/5'
                        : 'border-ink-10 hover:border-ink-20',
                    )}
                  >
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

        <section className="hidden rounded-2xl border border-ink-10 bg-white p-5 md:p-6 lg:block">
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
          ) : (
            <p className="rounded-xl border border-dashed border-ink-20 bg-ink-5/40 px-4 py-12 text-center text-[14px] text-ink-40">
              {t('engagements.empty')}
            </p>
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
          <div className="mt-3 flex gap-2">
            <input
              value={message}
              disabled={posting}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t('engagements.messagePlaceholder')}
              className="w-full rounded-xl border border-ink-10 bg-white px-4 py-2.5 text-[13px]"
            />
            <Button variant="dark" disabled={posting || !message.trim()} onClick={onSendMessage}>
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
            <Button variant="dark" loading={accepting} disabled={declining} onClick={onAccept}>
              {t('engagements.accept')}
            </Button>
            <Button variant="outline" loading={declining} disabled={accepting} onClick={onDecline}>
              {t('engagements.decline')}
            </Button>
          </div>
        </div>
      ) : null}

      {engagement.status === 'accepted' ? (
        <Button className="mt-6" variant="primary" loading={completing} onClick={onComplete}>
          {t('engagements.complete')}
        </Button>
      ) : null}
    </>
  );
}
