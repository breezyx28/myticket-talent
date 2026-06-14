import type { RoleApplicationTalentDetail } from '@/api/types/roleApplication';
import type { TalentProfileMe } from '@/api/types/user';

export type ProfileImageFields = {
  profile_image?: string | null;
  profile_image_url?: string | null;
  avatar_url?: string | null;
};

/** Prefer API alias `profile_image`, fall back to canonical `profile_image_url`, then `avatar_url`. */
export function resolveProfileImageUrl(source: ProfileImageFields | null | undefined): string | null {
  if (!source) return null;
  const alias = source.profile_image;
  if (typeof alias === 'string' && alias.trim()) return alias;
  const canonical = source.profile_image_url;
  if (typeof canonical === 'string' && canonical.trim()) return canonical;
  const avatar = source.avatar_url;
  if (typeof avatar === 'string' && avatar.trim()) return avatar;
  return null;
}

/** Application onboarding payload. */
export function getTalentProfileImageUrl(
  talentApplication: RoleApplicationTalentDetail | null | undefined,
): string | null {
  return resolveProfileImageUrl(talentApplication);
}

/** Live `GET /me/talent-profile` payload. */
export function getTalentLiveProfileImageUrl(
  profile: ProfileImageFields | null | undefined,
): string | null {
  return resolveProfileImageUrl(profile);
}

/** Prefer API alias `saudi_region_id`, fall back to canonical `region_id`. */
export function getTalentRegionId(
  talentApplication: RoleApplicationTalentDetail | null | undefined,
): number | undefined {
  if (!talentApplication) return undefined;
  const raw = talentApplication.saudi_region_id ?? talentApplication.region_id;
  if (raw == null || raw === '') return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
}

/** Prefer live profile `stage_name`, fall back to application onboarding value. */
export function getTalentStageName(
  profile: Pick<TalentProfileMe, 'stage_name'> | null | undefined,
  application?: RoleApplicationTalentDetail | null,
): string {
  const fromProfile = profile?.stage_name?.trim();
  if (fromProfile) return fromProfile;
  const fromApplication = application?.stage_name?.trim();
  if (fromApplication) return fromApplication;
  return '';
}

/** Contact fields are stored on the role application, not the live profile. */
export function getTalentContactEmail(application?: RoleApplicationTalentDetail | null): string {
  return application?.contact_email?.trim() ?? '';
}

export function getTalentContactPhone(application?: RoleApplicationTalentDetail | null): string {
  return application?.contact_phone?.trim() ?? '';
}

/** Prefer `city`, fall back to canonical `city_id`. */
export function getTalentCityId(
  talentApplication: RoleApplicationTalentDetail | null | undefined,
): number | undefined {
  if (!talentApplication) return undefined;
  const raw = talentApplication.city ?? talentApplication.city_id;
  if (raw == null || raw === '') return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
}
