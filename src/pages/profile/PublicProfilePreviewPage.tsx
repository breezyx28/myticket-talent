import { AvailabilityToggle } from '@/components/talent/AvailabilityToggle';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useGetTalentProfileQuery } from '@/api/endpoints';
import { ENV } from '@/config/env';
import { ExternalLink, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function PublicProfilePreviewPage() {
  const { t } = useTranslation();
  const { data: profile } = useGetTalentProfileQuery();

  if (!profile) return null;

  const publicUrl = `${ENV.mainWebsiteUrl}/artists/${profile.slug}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-extrabold text-ink">{t('nav.preview')}</h1>
          <p className="mt-2 text-[14px] text-ink-60">{t('profile.publicSlug')}</p>
        </div>
        <a href={publicUrl} target="_blank" rel="noreferrer">
          <Button variant="outline">
            <ExternalLink size={16} />
            {t('nav.preview')}
          </Button>
        </a>
      </div>

      <article className="overflow-hidden rounded-3xl border border-ink-10 bg-white shadow-card-md">
        <div className="grid gap-0 md:grid-cols-[240px_1fr]">
          {profile.profile_image_url ? (
            <img src={profile.profile_image_url} alt="" className="h-full min-h-[240px] w-full object-cover" />
          ) : (
            <div className="min-h-[240px] bg-gradient-to-br from-lemon/40 to-coral/20" />
          )}
          <div className="p-6 md:p-8">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-extrabold text-ink">{profile.stage_name}</h2>
              <AvailabilityToggle status={profile.availability_status} readOnly />
            </div>
            <div className="mt-3 flex items-center gap-2 text-[14px] font-semibold text-ink" dir="ltr">
              <Star size={16} className="fill-lemon text-lemon" />
              {profile.rating_average} · {t('ratings.count', { count: profile.rating_count })}
            </div>
            {profile.bio ? (
              <p className="mt-4 text-[14px] leading-relaxed text-ink-60">{profile.bio}</p>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-2">
              {profile.categories?.map((c) => (
                <Badge key={c.id} variant="success">
                  #{c.talent_category_id}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        {profile.gallery && profile.gallery.length > 0 ? (
          <div className="grid grid-cols-2 gap-2 border-t border-ink-10 p-4 sm:grid-cols-4">
            {profile.gallery.map((item) => (
              <img
                key={item.id}
                src={item.image_url}
                alt={item.caption ?? ''}
                className="aspect-square rounded-2xl object-cover"
              />
            ))}
          </div>
        ) : null}
      </article>
    </div>
  );
}
