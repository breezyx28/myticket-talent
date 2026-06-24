import { ENV } from '@/config/env';

/** Map notification href to an in-app path, or null for external URLs. */
export function resolveNotificationPath(href: string | null | undefined): string | null {
  if (!href?.trim()) return null;
  const value = href.trim();

  try {
    const url = new URL(value, window.location.origin);
    const pathWithQuery = `${url.pathname}${url.search}`;

    if (url.origin !== window.location.origin) {
      const mainOrigin = new URL(ENV.mainWebsiteUrl).origin;
      if (url.origin === mainOrigin) {
        if (pathWithQuery.startsWith('/engagements')) return pathWithQuery;
        if (pathWithQuery.startsWith('/application')) return pathWithQuery;
        if (pathWithQuery === '/' || pathWithQuery.startsWith('/profile')) return pathWithQuery;
      }
      return null;
    }

    return pathWithQuery;
  } catch {
    if (value.startsWith('/')) return value;
    return null;
  }
}

export function isExternalNotificationHref(href: string | null | undefined): boolean {
  if (!href?.trim()) return false;
  return resolveNotificationPath(href) === null && /^https?:\/\//i.test(href.trim());
}

export function navigateToNotificationHref(
  href: string | null | undefined,
  navigate: (path: string) => void,
): void {
  if (!href?.trim()) return;
  const path = resolveNotificationPath(href);
  if (path) {
    navigate(path);
    return;
  }
  if (isExternalNotificationHref(href)) {
    window.location.assign(href.trim());
  }
}
