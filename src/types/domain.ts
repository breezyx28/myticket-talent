/** Domain types for the Talent Dashboard. */

export type UserRole = 'guest' | 'talent' | 'vendor' | 'organizer';

export type RoleApplicationStatus =
  | 'not_started'
  | 'draft'
  | 'submitted'
  | 'approved'
  | 'rejected';

export type TalentAvailability = 'available' | 'reserved';

export type EngagementStatus =
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'cancelled'
  | 'closed';

export interface TalentProfileCategory {
  id: number;
  talent_profile_id?: number | null;
  talent_application_id?: number | null;
  talent_category_id: number;
  slug: string;
  name_en: string;
  name_ar: string;
  is_custom: boolean;
}

export interface TalentProfileGalleryItem {
  id: number;
  talent_profile_id: number;
  image_url: string;
  caption: string | null;
  position: number;
}

export interface TalentProfile {
  id: number;
  user_id: number;
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
}

export interface TalentApplicationMedia {
  id: number;
  kind: 'url' | 'video' | 'image' | 'certificate';
  value: string;
  label: string | null;
  position: number;
}

export interface TalentApplicationDetail {
  id: number;
  status: RoleApplicationStatus;
  submitted_at?: string | null;
  rejection_reason?: string | null;
  talent_application?: {
    id: number;
    stage_name?: string | null;
    bio?: string | null;
    contact_email?: string | null;
    contact_phone?: string | null;
    saudi_region_id?: number | null;
    city?: number | null;
    travel_ready?: boolean | null;
    location_public?: boolean | null;
    certificate_name?: string | null;
    accepted_quality_disclaimer?: boolean | null;
    profile_image?: string | null;
    media?: TalentApplicationMedia[];
    categories?: TalentProfileCategory[];
  } | null;
}

export const APPLICATION_STATUS_PILL: Record<string, string> = {
  draft: 'bg-ink-5 text-ink-60',
  submitted: 'bg-sky/30 text-ink-DEFAULT',
  approved: 'bg-mint/30 text-mint-dark',
  rejected: 'bg-coral/15 text-coral',
};

export const ENGAGEMENT_STATUS_PILL: Record<string, string> = {
  pending: 'bg-ink-5 text-ink-60',
  accepted: 'bg-mint/30 text-mint-dark',
  declined: 'bg-coral/15 text-coral',
  cancelled: 'bg-ink-5 text-ink-40',
  closed: 'bg-lavender/30 text-ink-DEFAULT',
};
