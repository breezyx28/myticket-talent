import { Button } from '@/components/ui/Button';
import { getTalentLiveProfileImageUrl } from '@/lib/talentApplicationFields';
import type { TalentProfileMe } from '@/api/types/user';
import { ENV } from '@/config/env';
import { CheckCircle2, Circle, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

function CheckItem({ done, label }: { done: boolean; label: string }) {
  return (
    <li className="flex items-center gap-2 text-[13px]">
      {done ? (
        <CheckCircle2 size={16} className="shrink-0 text-mint-dark" />
      ) : (
        <Circle size={16} className="shrink-0 text-ink-20" />
      )}
      <span className={done ? 'text-ink-60' : 'text-ink'}>{label}</span>
    </li>
  );
}

export function ProfileHeader({
  profile,
  govIdVerified,
  disclaimerAccepted,
}: {
  profile: TalentProfileMe;
  govIdVerified: boolean;
  disclaimerAccepted: boolean;
}) {
  const { t } = useTranslation();
  const profileImage = getTalentLiveProfileImageUrl(profile);
  const hasPhoto = Boolean(profileImage);
  const publicUrl = `${ENV.mainWebsiteUrl}/artists/${profile.slug}`;

  return (
    <div className="flex flex-wrap items-start gap-5 border-b border-ink-10 pb-6">
      {profileImage ? (
        <img
          src={profileImage}
          alt=""
          className="h-20 w-20 shrink-0 rounded-2xl object-cover ring-2 ring-ink-10"
        />
      ) : (
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-ink-5 text-[24px] font-bold text-ink-40">
          {profile.stage_name?.charAt(0) ?? '?'}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="text-[28px] font-extrabold tracking-tight text-ink">{profile.stage_name}</h1>
        <p className="mt-1 text-[14px] text-ink-60">{t('profile.subtitle')}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <a href={publicUrl} target="_blank" rel="noreferrer">
            <Button variant="secondary" size="sm">
              <ExternalLink size={14} />
              {t('profile.viewPublicProfile')}
            </Button>
          </a>
          <Link to="/preview">
            <Button variant="ghost" size="sm">
              {t('nav.preview')}
            </Button>
          </Link>
        </div>
      </div>
      <div className="w-full rounded-2xl bg-surface-muted px-4 py-3 sm:w-auto sm:min-w-[200px]">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-40">
          {t('profile.completionChecklist')}
        </p>
        <ul className="mt-2 space-y-1.5">
          <CheckItem done={govIdVerified} label={t('profile.checkGovId')} />
          <CheckItem done={disclaimerAccepted} label={t('profile.checkDisclaimer')} />
          <CheckItem done={hasPhoto} label={t('profile.checkPhoto')} />
        </ul>
      </div>
    </div>
  );
}
