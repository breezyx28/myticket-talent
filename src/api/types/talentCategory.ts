import type { Id } from '@/api/types/common';

export interface TalentCategory {
  id: Id;
  slug: string;
  name_en: string;
  name_ar: string;
  is_active: boolean;
  display_order: number;
  is_custom: boolean;
  created_by_user_id: Id | null;
  [key: string]: unknown;
}

export interface TalentCategoryAssignment {
  id: Id;
  talent_profile_id?: Id | null;
  talent_application_id?: Id | null;
  talent_category_id: Id;
  slug: string;
  name_en: string;
  name_ar: string;
  is_active?: boolean;
  display_order?: number;
  is_custom: boolean;
  created_by_user_id?: Id | null;
  [key: string]: unknown;
}

export type SyncTalentCategoryItem =
  | { talent_category_id: Id; category_id?: never; slug?: never; name_en?: never; name?: never }
  | { category_id: Id; talent_category_id?: never; slug?: never; name_en?: never; name?: never }
  | { slug: string; talent_category_id?: never; category_id?: never; name_en?: never; name?: never }
  | { name_en: string; name_ar?: string; name?: string; talent_category_id?: never; category_id?: never; slug?: never };

export interface SyncTalentCategoriesRequest {
  categories: SyncTalentCategoryItem[];
}

export interface SyncTalentCategoriesResponse {
  categories: TalentCategoryAssignment[];
}

export interface CreateTalentCategoryRequest {
  name_en?: string;
  name?: string;
  name_ar?: string;
}
