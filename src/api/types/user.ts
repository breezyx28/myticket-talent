import type { Id, Iso8601 } from '@/api/types/common';
import type { TalentProfileCategory, TalentProfileGalleryItem } from '@/api/types/talent';
import type { TalentAvailability } from '@/types/domain';

export interface UserMe {
  id: Id;
  email: string;
  phone?: string | null;
  full_name: string;
  display_name?: string | null;
  bio?: string | null;
  profile_image_url?: string | null;
  avatar_url?: string | null;
  email_verified_at?: Iso8601 | null;
  phone_verified_at?: Iso8601 | null;
  two_factor_enabled?: boolean;
  role?: string | null;
  roles?: string[];
  created_at?: Iso8601;
  updated_at?: Iso8601;
  [key: string]: unknown;
}

export type LanguagePreference = 'en' | 'ar';
export type ThemePreference = 'system' | 'light' | 'dark';

export interface UserPreferences {
  language: LanguagePreference;
  theme: ThemePreference;
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
  marketing_emails: boolean;
  [key: string]: unknown;
}

export interface UserPreferencesResponse {
  data: UserPreferences;
}

export interface UpdateUserPreferencesRequest {
  language?: LanguagePreference;
  theme?: ThemePreference;
  email_notifications?: boolean;
  push_notifications?: boolean;
  sms_notifications?: boolean;
  marketing_emails?: boolean;
}

export interface TalentAvailabilityResponse {
  status: TalentAvailability;
  [key: string]: unknown;
}

export interface UpdateTalentAvailabilityRequest {
  status: TalentAvailability;
}

export interface TalentProfileMe {
  id: Id;
  user_id: Id;
  slug: string;
  stage_name: string;
  bio: string | null;
  region_id: number | null;
  city_id: number | null;
  profile_image_url: string | null;
  intro_video_url: string | null;
  instagram_handle: string | null;
  website_url: string | null;
  travel_ready: boolean;
  location_public: boolean;
  availability_status: TalentAvailability;
  rating_average: string;
  rating_count: number;
  completed_bookings: number;
  is_active: boolean;
  categories?: TalentProfileCategory[];
  gallery?: TalentProfileGalleryItem[];
  created_at?: Iso8601;
  updated_at?: Iso8601;
  [key: string]: unknown;
}

export interface UpdateTalentProfileRequest {
  stage_name?: string;
  bio?: string | null;
  website_url?: string | null;
  instagram_handle?: string | null;
  travel_ready?: boolean;
  location_public?: boolean;
}
