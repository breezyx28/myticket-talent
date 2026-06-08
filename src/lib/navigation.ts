/** Prevent open redirects: only allow same-app relative paths. */
export function getSafeRedirectPath(pathname: string | undefined | null): string | null {
  if (!pathname || typeof pathname !== 'string') return null;
  const trimmed = pathname.trim();
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) return null;
  return trimmed;
}
