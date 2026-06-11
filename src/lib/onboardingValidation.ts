import type { TalentApplicationDetail } from '@/types/domain';

export const TALENT_BIO_MIN_CHARS = 30;
export const TALENT_BIO_MAX_CHARS = 500;
export const STAGE_NAME_MAX = 160;
export const CONTACT_PHONE_MAX = 20;
export const MEDIA_URL_MAX = 500;

export function isTalentApplicationReady(app: TalentApplicationDetail): boolean {
  const t = app.talent_application;
  if (!t) return false;
  return (
    Boolean(t.stage_name?.trim()) &&
    Boolean(t.contact_email?.trim()) &&
    (t.bio?.trim().length ?? 0) >= TALENT_BIO_MIN_CHARS &&
    (t.media?.length ?? 0) > 0 &&
    (t.categories?.length ?? 0) > 0 &&
    Boolean(t.accepted_quality_disclaimer)
  );
}
