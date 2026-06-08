import { useGetTalentProfileQuery, useListTalentRatingsQuery } from '@/api/endpoints';
import { Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';

function StarsRow({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5" dir="ltr" aria-label={`${value} stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={18}
          className={i < value ? 'fill-lemon text-lemon' : 'text-ink-20'}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

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
      <div>
        <h1 className="text-[28px] font-extrabold text-ink">{t('ratings.title')}</h1>
        {profile ? (
          <div className="mt-4 flex flex-wrap items-center gap-4 rounded-2xl border border-ink-10 bg-white px-5 py-4 shadow-card-sm">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-40">
                {t('ratings.average')}
              </p>
              <p className="font-mono text-3xl font-bold text-ink" dir="ltr">
                {profile.rating_average}
              </p>
            </div>
            <StarsRow value={Math.round(Number(profile.rating_average) || 0)} />
            <p className="text-[13px] text-ink-60">{t('ratings.count', { count: profile.rating_count })}</p>
          </div>
        ) : null}
      </div>

      {isLoading ? (
        <p className="text-[14px] text-ink-60">{t('common.loading')}</p>
      ) : ratings.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-ink-20 bg-ink-5/40 px-6 py-10 text-center text-[14px] text-ink-40">
          {t('ratings.empty')}
        </p>
      ) : (
        <ul className="space-y-3">
          {ratings.map((rating) => (
            <li
              key={rating.id}
              className="flex items-center justify-between gap-4 rounded-2xl border border-ink-10 bg-white px-5 py-4 shadow-card-sm"
            >
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
