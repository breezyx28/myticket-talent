const DEFAULT_API_BASE = 'https://myticket-api.kat-jr.com';

export const ENV = {
  apiBase: import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE,
  apiPrefix: import.meta.env.VITE_API_PREFIX ?? '/api/v1/main',
  mainWebsiteUrl: import.meta.env.VITE_MAIN_WEBSITE_URL ?? 'https://myticket.kat-jr.com',
  talentDashboardUrl: import.meta.env.VITE_TALENT_DASHBOARD_URL ?? 'https://myticket-talent.kat-jr.com',
  uploadUrl: import.meta.env.VITE_UPLOAD_URL ?? '',
  reverb: {
    key: import.meta.env.VITE_REVERB_APP_KEY ?? 'fysuwmddunkddyla1das',
    host: import.meta.env.VITE_REVERB_HOST ?? 'myticket-api.kat-jr.com',
    port: Number(import.meta.env.VITE_REVERB_PORT ?? 443),
    scheme: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') as 'http' | 'https',
  },
} as const;

/** Origin for broadcasting auth (no API prefix). */
export const broadcastingAuthUrl = `${ENV.apiBase.replace(/\/$/, '')}/broadcasting/auth`;
