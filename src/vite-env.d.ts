/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_API_PREFIX?: string;
  readonly VITE_MAIN_WEBSITE_URL?: string;
  readonly VITE_TALENT_DASHBOARD_URL?: string;
  readonly VITE_UPLOAD_URL?: string;
  readonly VITE_UPLOAD_API_KEY?: string;
  readonly VITE_DEV_PORT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
