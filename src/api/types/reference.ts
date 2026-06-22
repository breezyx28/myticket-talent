import type { Id } from '@/api/types/common';

/** `GET /reference/saudi-regions`. */
export interface SaudiCityRef {
  id: Id;
  name_en?: string | null;
  name_ar?: string | null;
  /** Legacy alias for `name_en`. */
  name?: string | null;
  [key: string]: unknown;
}

export interface SaudiRegionRef {
  id: Id;
  name_en?: string | null;
  name_ar?: string | null;
  /** Legacy alias for `name_en`. */
  name?: string | null;
  cities: SaudiCityRef[];
  [key: string]: unknown;
}

export interface SaudiRegionsResponse {
  data: SaudiRegionRef[];
}
