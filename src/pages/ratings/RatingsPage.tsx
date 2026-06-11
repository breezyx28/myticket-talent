import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { useGetTalentProfileQuery, useListTalentRatingsQuery } from '@/api/endpoints';
import { Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

function StarsRow({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5" dir="ltr" aria-label={`${value} stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={18}
          className={i < value ? 'fill-coral text-coral' : 'text-ink-20'}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

/** Deep-link wrapper — ratings summary also appears on Home. */
export function RatingsPage() {
  const { t } = useTranslation();
  const { data: profile } = useGetTalentProfileQuery();
  const { data: ratingsPaged, isLoading } = useListTalentRatingsQuery(
    { slug: profile?.slug ?? '', page: 1, per_page: 20 },
    { skip: !profile?.slug },
  );

  const ratings = ratingsPaged?.data ?? [];

  return (
    <div className="space-y-8">
      <PageHeader
        title={t('ratings.title')}
        description={
          <Link to="/" className="font-semibold text-coral hover:underline">
            {t('nav.home')}
          </Link>
        }
      />

      {profile ? (
        <div className="flex flex-wrap items-center gap-4 border-b border-ink-10 pb-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-40">
              {t('ratings.average')}
            </p>
            <p className="tabular-nums font-mono text-3xl font-bold text-ink" dir="ltr">
              {profile.rating_average}
            </p>
          </div>
          <StarsRow value={Math.round(Number(profile.rating_average) || 0)} />
          <p className="text-[13px] text-ink-60">{t('ratings.count', { count: profile.rating_count })}</p>
        </div>
      ) : null}

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : ratings.length === 0 ? (
        <EmptyState icon={Star} title={t('ratings.empty')} actionLabel={t('nav.home')} actionHref="/" />
      ) : (
        <ul className="divide-y divide-ink-10">
          {ratings.map((rating) => (
            <li key={rating.id} className="flex items-center justify-between gap-4 py-4">
              <StarsRow value={Math.min(5, Math.max(0, Math.round(rating.stars)))} />
              {rating.created_at ? (
                <span className="text-[12px] text-ink-40" dir="ltr">
                  {new Date(rating.created_at).toLocaleDateString()}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
