import type { RoleApplicationTalentDetail } from '@/api/types/roleApplication';

export type ProfileImageFields = {
  profile_image?: string | null;
  profile_image_url?: string | null;
};

/** Prefer API alias `profile_image`, fall back to canonical `profile_image_url`. */
export function resolveProfileImageUrl(source: ProfileImageFields | null | undefined): string | null {
  if (!source) return null;
  const alias = source.profile_image;
  if (typeof alias === 'string' && alias.trim()) return alias;
  const canonical = source.profile_image_url;
  if (typeof canonical === 'string' && canonical.trim()) return canonical;
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
