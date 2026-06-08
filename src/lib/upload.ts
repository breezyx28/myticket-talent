import { ENV } from '@/config/env';

export interface UploadResult {
  url: string;
  contentType: string;
}

/**
 * Upload a file to your CDN/storage pipeline, return a public HTTPS URL.
 * Wire to VITE_UPLOAD_URL or a presigned-URL flow from your backend team.
 */
export async function uploadToCdn(file: File): Promise<UploadResult> {
  if (!ENV.uploadUrl) {
    throw new Error('Upload service is not configured.');
  }
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(ENV.uploadUrl, { method: 'POST', body: form });
  if (!res.ok) throw new Error('Upload failed.');
  const json = (await res.json()) as { url: string; content_type?: string };
  return { url: json.url, contentType: json.content_type ?? file.type };
}
