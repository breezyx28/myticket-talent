import type { Id, Iso8601 } from '@/api/types/common';
import type { TalentCategoryAssignment } from '@/api/types/talentCategory';
import type { RoleApplicationStatus } from '@/types/domain';

export type RoleApplicationKind = 'talent';

export interface RoleApplicationSummary {
  id: Id;
  kind?: RoleApplicationKind;
  application_type?: RoleApplicationKind;
  status: RoleApplicationStatus;
  submitted_at?: Iso8601 | null;
  rejection_reason?: string | null;
  [key: string]: unknown;
}

export interface MyRoleApplications {
  talent?: RoleApplicationSummary | null;
  [key: string]: unknown;
}

export interface CreateTalentApplicationRequest {
  stage_name: string;
  contact_email: string;
  contact_phone?: string;
  [key: string]: unknown;
}

export interface UpdateTalentApplicationRequest {
  stage_name?: string;
  bio?: string;
  contact_email?: string;
  contact_phone?: string;
  saudi_region_id?: number;
  city?: number;
  travel_ready?: boolean;
  location_public?: boolean;
  certificate_name?: string;
  accepted_quality_disclaimer?: boolean;
  internal_note?: string;
  profile_image?: string;
  [key: string]: unknown;
}

export interface TalentApplicationMedia {
  id: Id;
  kind: 'url' | 'video' | 'image' | 'certificate';
  value: string;
  label: string | null;
  position: number;
  created_at?: Iso8601;
  [key: string]: unknown;
}

export interface TalentApplicationMediaUpload {
  kind: 'url' | 'video' | 'image' | 'certificate';
  value: string;
  label?: string;
  position?: number;
}

export interface RoleApplicationTalentDetail {
  id: Id;
  stage_name?: string | null;
  bio?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  saudi_region_id?: Id | null;
  region_id?: Id | null;
  city?: Id | null;
  city_id?: Id | null;
  travel_ready?: boolean | null;
  location_public?: boolean | null;
  certificate_name?: string | null;
  accepted_quality_disclaimer?: boolean | null;
  government_id_status?: 'pending' | 'verified' | 'rejected' | null;
  profile_image?: string | null;
  profile_image_url?: string | null;
  media?: TalentApplicationMedia[];
  categories?: TalentCategoryAssignment[];
  [key: string]: unknown;
}

export interface RoleApplicationDetail {
  id: Id;
  kind?: RoleApplicationKind;
  application_type?: RoleApplicationKind;
  status: RoleApplicationStatus;
  submitted_at?: Iso8601 | null;
  rejection_reason?: string | null;
  internal_note?: string | null;
  talent_application?: RoleApplicationTalentDetail | null;
  [key: string]: unknown;
}

export interface RoleApplicationDetailEnvelope {
  data: RoleApplicationDetail;
}

export interface RoleApplicationSummaryEnvelope {
  data: RoleApplicationSummary;
}
