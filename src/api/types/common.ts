/**
 * Shared API types for the Talent Dashboard.
 */

export type Id = number | string;
export type Slug = string;
export type Iso8601 = string;

export interface ApiMessage {
  message: string;
}

export interface ApiValidationError extends ApiMessage {
  errors?: Record<string, string[]>;
}

export interface PaginationLink {
  url: string | null;
  label: string;
  page: number | null;
  active: boolean;
}

export interface Paginated<T> {
  current_page: number;
  data: T[];
  first_page_url: string | null;
  from: number | null;
  last_page: number;
  last_page_url: string | null;
  links: PaginationLink[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
}

export interface PaginationQuery {
  page?: number;
  per_page?: number;
}

export interface ResourceEnvelope<T> {
  data: T;
}

/** Single resource — may be bare or `{ data: T }`. */
export function unwrapData<T>(raw: T | { data: T } | null | undefined): T | null {
  if (raw == null) return null;
  if (typeof raw === 'object' && 'data' in (raw as object)) {
    return (raw as { data: T }).data;
  }
  return raw as T;
}
