import type { Id } from '@/api/types/common';

/** `GET /reference/saudi-regions`. */
export interface SaudiCityRef {
  id: Id;
  name: string;
  name_ar?: string | null;
  [key: string]: unknown;
}

export interface SaudiRegionRef {
  id: Id;
  name: string;
  name_ar?: string | null;
  cities: SaudiCityRef[];
  [key: string]: unknown;
}

export interface SaudiRegionsResponse {
  data: SaudiRegionRef[];
}
