import { AvailabilityToggle } from '@/components/talent/AvailabilityToggle';
import { GovernmentIdReminderBanner } from '@/components/talent/GovernmentIdReminderBanner';
import { StatBubble } from '@/components/talent/StatBubble';
import { StatusPill } from '@/components/talent/StatusPill';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import {
  useGetTalentAvailabilityQuery,
  useGetTalentProfileQuery,
  useListEngagementsQuery,
} from '@/api/endpoints';
import { ENV } from '@/config/env';
import { CalendarCheck, MessageSquare, Star, Ticket } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export function HomePage() {
  const { t } = useTranslation();
  const { data: profile } = useGetTalentProfileQuery();
  const { data: availability } = useGetTalentAvailabilityQuery();
  const { data: engagements } = useListEngagementsQuery({ page: 1, per_page: 50 });

  const pendingCount = useMemo(
    () => (engagements?.data ?? []).filter((e) => e.status === 'pending').length,
    [engagements],
  );

  const recent = useMemo(
    () =>
      [...(engagements?.data ?? [])]
        .sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime())
        .slice(0, 5),
    [engagements],
  );

  const availabilityStatus = availability?.status ?? profile?.availability_status ?? 'available';

  return (
    <div className="space-y-8">
      <GovernmentIdReminderBanner />

      {pendingCount > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-coral/30 bg-coral/5 px-5 py-4">
          <div className="flex items-center gap-3">
            <MessageSquare size={20} className="shrink-0 text-coral" />
            <p className="text-[14px] font-medium text-ink">
              {t('home.pendingEngagements', { count: pendingCount })}
            </p>
          </div>
          <Link
            to="/engagements"
            className="shrink-0 rounded-full bg-coral px-4 py-2 text-[13px] font-semibold text-white transition-transform hover:bg-coral-dark active:scale-[0.98]"
          >
            {t('home.viewAllEngagements')}
          </Link>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink-10 pb-6">
        <PageHeader
          title={profile?.stage_name ?? t('nav.home')}
          description={t('home.welcome')}
          className="flex-1"
        />
        <div className="flex items-center gap-3">
          <span className="text-[12px] font-medium text-ink-40">{t('availability.title')}</span>
          <AvailabilityToggle status={availabilityStatus} readOnly />
          <Link to="/profile?tab=location" className="text-[12px] font-semibold text-coral hover:underline">
            {t('home.manageAvailability')}
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <StatBubble
          label={t('ratings.average')}
          value={profile?.rating_average ?? '—'}
          icon={Star}
          className="sm:col-span-1"
          footer={
            <Link to="/ratings" className="text-[12px] font-semibold text-coral hover:underline">
              {t('home.viewRatings')} · {t('ratings.count', { count: profile?.rating_count ?? 0 })}
            </Link>
          }
        />
        <StatBubble
          label={t('home.completedBookings')}
          value={profile?.completed_bookings ?? 0}
          icon={CalendarCheck}
        />
        <StatBubble
          label={t('engagements.status_pending')}
          value={pendingCount}
          icon={MessageSquare}
          className={pendingCount > 0 ? 'ring-1 ring-coral/30' : undefined}
          footer={
            <Link to="/engagements" className="text-[12px] font-semibold text-coral hover:underline">
              {t('home.viewAllEngagements')}
            </Link>
          }
        />
        <StatBubble
          label={t('availability.title')}
          value={<AvailabilityToggle status={availabilityStatus} readOnly />}
          footer={
            <Link to="/profile?tab=location" className="text-[12px] font-semibold text-coral hover:underline">
              {t('profile.tabs.location')}
            </Link>
          }
        />
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-extrabold text-ink">{t('home.recentActivity')}</h2>
          <a
            href={`${ENV.mainWebsiteUrl}/my-tickets`}
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-60 hover:text-coral"
          >
            <Ticket size={14} />
            {t('home.myTickets')}
          </a>
        </div>
        {recent.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title={t('engagements.empty')}
            description={t('home.recentActivityHint')}
            actionLabel={t('nav.engagements')}
            actionHref="/engagements"
          />
        ) : (
          <ul className="divide-y divide-ink-10">
            {recent.map((e) => (
              <li key={e.id}>
                <Link
                  to={`/engagements?focus=${e.id}`}
                  className="flex items-center justify-between gap-4 py-4 transition-colors hover:bg-ink-5/50"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-ink">{e.topic}</p>
                    <p className="mt-0.5 text-[12px] text-ink-40">
                      {e.organizer_profile_snapshot?.display_name ?? t('engagements.organizer')} ·{' '}
                      <span dir="ltr">{new Date(e.last_message_at).toLocaleString()}</span>
                    </p>
                  </div>
                  <StatusPill
                    status={e.status}
                    label={t(`engagements.status_${e.status}` as 'engagements.status_pending')}
                  />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
