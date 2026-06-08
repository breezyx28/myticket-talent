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
