export function readApiErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object') {
    const data = (err as { data?: unknown }).data;
    if (data && typeof data === 'object') {
      const message = (data as { message?: unknown }).message;
      if (typeof message === 'string' && message.trim()) return message;
      const errors = (data as { errors?: Record<string, string[]> }).errors;
      if (errors) {
        const first = Object.values(errors).flat()[0];
        if (first) return first;
      }
    }
  }
  return fallback;
}

/** RTK Query / fetchBaseQuery error when the resource does not exist yet. */
export function isHttpNotFound(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const status = (err as { status?: unknown }).status;
  if (status === 404 || status === '404') return true;
  return (err as { originalStatus?: unknown }).originalStatus === 404;
}

export function readApiFieldErrors(err: unknown): Record<string, string[]> {
  if (err && typeof err === 'object') {
    const data = (err as { data?: unknown }).data;
    if (data && typeof data === 'object') {
      const errors = (data as { errors?: Record<string, string[]> }).errors;
      if (errors && typeof errors === 'object') return errors;
    }
  }
  return {};
}
