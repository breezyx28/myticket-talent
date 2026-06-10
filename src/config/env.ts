const DEFAULT_API_BASE = 'https://myticket-api.kat-jr.com';

export const ENV = {
  apiBase: import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE,
  apiPrefix: import.meta.env.VITE_API_PREFIX ?? '/api/v1/main',
  mainWebsiteUrl: import.meta.env.VITE_MAIN_WEBSITE_URL ?? 'https://myticket.kat-jr.com',
  talentDashboardUrl: import.meta.env.VITE_TALENT_DASHBOARD_URL ?? 'https://myticket-talent.kat-jr.com',
  uploadUrl: import.meta.env.VITE_UPLOAD_URL ?? '',
} as const;
