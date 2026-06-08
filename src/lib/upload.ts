import { API_BASE_URL } from '@/api/baseApi';
import { getToken } from '@/api/authToken';
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
