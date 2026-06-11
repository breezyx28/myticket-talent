import type { Id, Iso8601 } from '@/api/types/common';

export type GovernmentIdDocumentType = 'national_id' | 'iqama' | 'passport';

export type GovernmentIdVerificationStatus = 'pending' | 'verified' | 'rejected';

export interface GovernmentIdVerification {
  id: Id;
  user_id: Id;
  document_type: GovernmentIdDocumentType;
  document_number: string | null;
  front_image_url: string;
  back_image_url: string | null;
  selfie_url: string | null;
  issue_date: string | null;
  expiry_date: string | null;
  status: GovernmentIdVerificationStatus;
  rejection_reason: string | null;
  created_at?: Iso8601;
  updated_at?: Iso8601;
  [key: string]: unknown;
}

export interface SubmitGovernmentIdVerificationRequest {
  document_type: GovernmentIdDocumentType;
  document_number?: string | null;
  front_image_url: string;
  back_image_url?: string | null;
  selfie_url?: string | null;
  issue_date?: string | null;
  expiry_date?: string | null;
}
