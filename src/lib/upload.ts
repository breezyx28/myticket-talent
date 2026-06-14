import { API_BASE_URL } from '@/api/baseApi';
import { getToken } from '@/api/authToken';
import type { ProfileImageUploadResult } from '@/api/types/user';
import { readApiErrorMessage } from '@/lib/apiErrors';
import { unwrapData } from '@/api/types/common';

export interface UploadResult {
  url: string;
  contentType: string;
}

export type UploadContext = 'talent_application' | 'vendor_application' | 'vendor_document';

interface UploadResponseBody {
  url: string;
  content_type?: string;
  size_bytes?: number;
}

const PROFILE_IMAGE_MAX_BYTES = 4 * 1024 * 1024;
const PROFILE_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp']);

export class ProfileImageValidationError extends Error {
  constructor(code: 'invalid_type' | 'too_large') {
    super(code);
    this.name = 'ProfileImageValidationError';
  }
}

export function validateProfileImageFile(file: File): void {
  if (!PROFILE_IMAGE_TYPES.has(file.type)) {
    throw new ProfileImageValidationError('invalid_type');
  }
  if (file.size > PROFILE_IMAGE_MAX_BYTES) {
    throw new ProfileImageValidationError('too_large');
  }
}

/**
 * Upload profile photo via `POST /api/v1/main/me/profile-image` (Bearer auth).
 * Updates user + synced talent/vendor profile images on the server.
 */
export async function uploadProfileImage(file: File): Promise<ProfileImageUploadResult> {
  validateProfileImageFile(file);

  const form = new FormData();
  form.append('image', file);

  const headers: HeadersInit = { Accept: 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/me/profile-image`, {
    method: 'POST',
    body: form,
    headers,
  });

  if (!res.ok) {
    let message = 'Upload failed.';
    try {
      const json = (await res.json()) as unknown;
      message = readApiErrorMessage({ data: json }, message);
    } catch {
      /* ignore parse errors */
    }
    throw new Error(message);
  }

  const json = (await res.json()) as ProfileImageUploadResult | { data: ProfileImageUploadResult };
  const data = unwrapData(json) ?? (json as ProfileImageUploadResult);

  if (!data?.profile_image_url) {
    throw new Error('Upload response did not include a profile image URL.');
  }

  return data;
}

/**
 * Upload via `POST /api/v1/main/uploads` (Bearer auth).
 * Returns a public URL for role-application PATCH / media endpoints.
 */
export async function uploadToCdn(
  file: File,
  context: UploadContext = 'talent_application',
): Promise<UploadResult> {
  const form = new FormData();
  form.append('file', file);
  form.append('context', context);

  const headers: HeadersInit = { Accept: 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/uploads`, {
    method: 'POST',
    body: form,
    headers,
  });

  if (!res.ok) {
    let message = 'Upload failed.';
    try {
      const json = (await res.json()) as unknown;
      message = readApiErrorMessage({ data: json }, message);
    } catch {
      /* ignore parse errors */
    }
    throw new Error(message);
  }

  const json = (await res.json()) as UploadResponseBody | { data: UploadResponseBody };
  const data = unwrapData(json) ?? (json as UploadResponseBody);

  if (!data?.url) {
    throw new Error('Upload response did not include a URL.');
  }

  return {
    url: data.url,
    contentType: data.content_type ?? file.type,
  };
}
