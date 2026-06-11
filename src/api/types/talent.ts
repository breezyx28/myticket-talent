import type { Id, Iso8601, Slug } from '@/api/types/common';
import type { TalentCategoryAssignment } from '@/api/types/talentCategory';
import type { TalentAvailability } from '@/types/domain';

export type TalentProfileCategory = TalentCategoryAssignment;

export interface TalentProfileGalleryItem {
  id: Id;
  talent_profile_id: Id;
  image_url: string;
  caption: string | null;
  position: number;
  created_at?: Iso8601;
  [key: string]: unknown;
}

export interface Talent {
  id: Id;
  user_id?: Id;
  slug: Slug;
  stage_name: string;
  bio?: string | null;
  region_id?: number | null;
  city_id?: number | null;
  profile_image_url?: string | null;
  intro_video_url?: string | null;
  instagram_handle?: string | null;
  website_url?: string | null;
  travel_ready?: boolean;
  location_public?: boolean;
  availability_status?: TalentAvailability;
  rating_average?: string | number | null;
  rating_count?: number;
  completed_bookings?: number;
  is_active?: boolean;
  categories?: TalentProfileCategory[];
  gallery?: TalentProfileGalleryItem[];
  created_at?: Iso8601;
  updated_at?: Iso8601;
  [key: string]: unknown;
}

export interface TalentRating {
  id: Id;
  user_id?: Id;
  target_type?: string;
  target_id?: Id;
  engagement_id?: Id | null;
  stars: number;
  comment?: string | null;
  is_visible?: boolean;
  created_at?: Iso8601;
  updated_at?: Iso8601;
  [key: string]: unknown;
}
