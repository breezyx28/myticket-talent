import type { RoleApplicationTalentDetail } from '@/api/types/roleApplication';

/** Prefer API alias `profile_image`, fall back to canonical `profile_image_url`. */
export function getTalentProfileImageUrl(
  talentApplication: RoleApplicationTalentDetail | null | undefined,
): string | null {
  if (!talentApplication) return null;
  const alias = talentApplication.profile_image;
  if (typeof alias === 'string' && alias.trim()) return alias;
  const canonical = talentApplication.profile_image_url;
  if (typeof canonical === 'string' && canonical.trim()) return canonical;
  return null;
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
