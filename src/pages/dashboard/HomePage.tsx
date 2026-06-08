import { Button } from '@/components/ui/Button';
import { AvailabilityToggle } from '@/components/talent/AvailabilityToggle';
import { StatBubble } from '@/components/talent/StatBubble';
import { StatusPill } from '@/components/talent/StatusPill';
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[32px] font-extrabold tracking-tight text-ink">
          {profile?.stage_name ?? t('nav.home')}
        </h1>
        <p className="mt-2 text-[14px] text-ink-60">{t('nav.home')}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatBubble
          label={t('ratings.average')}
          value={profile?.rating_average ?? '—'}
          icon={Star}
          footer={
            <p className="text-[12px] text-ink-40">
              {t('ratings.count', { count: profile?.rating_count ?? 0 })}
            </p>
          }
        />
        <StatBubble
          label="Completed bookings"
          value={profile?.completed_bookings ?? 0}
          icon={CalendarCheck}
        />
        <StatBubble
          label={t('engagements.status_pending')}
          value={pendingCount}
          icon={MessageSquare}
          footer={
            <Link to="/engagements" className="text-[12px] font-semibold text-coral hover:underline">
              {t('nav.engagements')}
            </Link>
          }
        />
        <StatBubble
          label={t('availability.title')}
          value={
            <AvailabilityToggle
              status={availability?.status ?? profile?.availability_status ?? 'available'}
              readOnly
            />
          }
          footer={
            <Link to="/availability" className="text-[12px] font-semibold text-coral hover:underline">
              {t('nav.availability')}
            </Link>
          }
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Link to="/engagements">
          <Button variant="dark">{t('nav.engagements')}</Button>
        </Link>
        <Link to="/profile">
          <Button variant="outline">{t('nav.profile')}</Button>
        </Link>
        <Link to="/preview">
          <Button variant="outline">{t('nav.preview')}</Button>
        </Link>
        <a href={`${ENV.mainWebsiteUrl}/my-tickets`} rel="noreferrer">
          <Button variant="ghost">
            <Ticket size={16} />
            My tickets
          </Button>
        </a>
      </div>

      <section className="rounded-3xl border border-ink-10 bg-white p-6 shadow-card-sm">
        <h2 className="text-lg font-extrabold text-ink">{t('engagements.title')}</h2>
        {recent.length === 0 ? (
          <p className="mt-4 text-[14px] text-ink-40">{t('engagements.empty')}</p>
        ) : (
          <ul className="mt-4 divide-y divide-ink-10">
            {recent.map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <p className="font-semibold text-ink">{e.topic}</p>
                  <p className="text-[12px] text-ink-40">
                    {e.organizer_profile_snapshot?.display_name ?? 'Organizer'} ·{' '}
                    <span dir="ltr">{new Date(e.last_message_at).toLocaleString()}</span>
                  </p>
                </div>
                <StatusPill
                  status={e.status}
                  label={t(`engagements.status_${e.status}` as 'engagements.status_pending')}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
