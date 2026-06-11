import { describe, expect, it } from 'vitest';
import {
  buildSyncPayload,
  categoryIdsFromAssignments,
  getTalentCategoryLabel,
  hasMinimumCategories,
} from '@/lib/talentCategories';

describe('talentCategories', () => {
  it('labels categories by locale', () => {
    expect(getTalentCategoryLabel({ name_en: 'Singer', name_ar: 'مغني', slug: 'singer' }, 'en')).toBe(
      'Singer',
    );
    expect(getTalentCategoryLabel({ name_en: 'Singer', name_ar: 'مغني', slug: 'singer' }, 'ar')).toBe(
      'مغني',
    );
  });

  it('maps assignment ids for picker state', () => {
    expect(
      categoryIdsFromAssignments([
        {
          id: 1,
          talent_category_id: 3,
          slug: 'singer',
          name_en: 'Singer',
          name_ar: 'مغني',
          is_custom: false,
        },
      ]),
    ).toEqual(new Set(['3']));
  });

  it('builds sync payload from selected ids and custom names', () => {
    const reference = [
      {
        id: 1,
        slug: 'singer',
        name_en: 'Singer',
        name_ar: 'مغني',
        is_active: true,
        display_order: 1,
        is_custom: false,
        created_by_user_id: null,
      },
    ];

    expect(buildSyncPayload(new Set(['1']), ['Standup'], reference)).toEqual([
      { talent_category_id: 1 },
      { name_en: 'Standup' },
    ]);
  });

  it('requires at least one category', () => {
    expect(hasMinimumCategories(0)).toBe(false);
    expect(hasMinimumCategories(1)).toBe(true);
  });
});
