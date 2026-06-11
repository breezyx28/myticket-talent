import type {
  SyncTalentCategoryItem,
  TalentCategory,
  TalentCategoryAssignment,
} from '@/api/types/talentCategory';
import type { AppLanguage } from '@/i18n';

export function getTalentCategoryLabel(
  category: Pick<TalentCategoryAssignment, 'name_en' | 'name_ar' | 'slug'>,
  language: string,
): string {
  if (language === 'ar' && category.name_ar?.trim()) return category.name_ar.trim();
  if (category.name_en?.trim()) return category.name_en.trim();
  return category.slug;
}

export function assignmentsToSyncItems(
  assignments: TalentCategoryAssignment[] | undefined,
): SyncTalentCategoryItem[] {
  return (assignments ?? []).map((item) => {
    if (item.talent_category_id != null) {
      return { talent_category_id: item.talent_category_id };
    }
    if (item.slug) return { slug: item.slug };
    if (item.name_en) return { name_en: item.name_en, name_ar: item.name_ar ?? undefined };
    return { talent_category_id: item.id };
  });
}

export function categoryIdsFromAssignments(assignments: TalentCategoryAssignment[] | undefined): Set<string> {
  return new Set(
    (assignments ?? [])
      .map((item) => item.talent_category_id)
      .filter((id) => id != null)
      .map(String),
  );
}

export function customNamesFromAssignments(_assignments: TalentCategoryAssignment[] | undefined): string[] {
  return [];
}

export function buildSyncPayload(
  selectedCategoryIds: Set<string>,
  customNames: string[],
  reference: TalentCategory[],
): SyncTalentCategoryItem[] {
  const items: SyncTalentCategoryItem[] = [];

  for (const id of selectedCategoryIds) {
    const match = reference.find((cat) => String(cat.id) === id);
    if (match?.slug) {
      items.push({ talent_category_id: match.id });
    } else {
      items.push({ talent_category_id: id });
    }
  }

  for (const name of customNames) {
    const trimmed = name.trim();
    if (!trimmed) continue;
    const existing = reference.find(
      (cat) => cat.name_en.toLowerCase() === trimmed.toLowerCase() || cat.slug === slugifyCategoryName(trimmed),
    );
    if (existing) {
      if (!selectedCategoryIds.has(String(existing.id))) {
        items.push({ talent_category_id: existing.id });
      }
      continue;
    }
    items.push({ name_en: trimmed });
  }

  return items;
}

export function slugifyCategoryName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function hasMinimumCategories(count: number): boolean {
  return count >= 1;
}

export function resolveAppLanguage(language: string): AppLanguage {
  return language === 'ar' ? 'ar' : 'en';
}
