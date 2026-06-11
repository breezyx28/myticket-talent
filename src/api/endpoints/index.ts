/**
 * Single import surface for every domain's RTK Query hooks.
 *
 * Pages can do:
 *   import { useGetMeQuery, useLoginMutation } from '@/api/endpoints';
 *
 * Each underlying file calls `baseApi.injectEndpoints` so the live `baseApi`
 * is augmented as soon as it is imported.
 */

export * from './auth';
export * from './me';
export * from './roleApplications';
export * from './engagements';
export * from './talents';
export * from './reference';
export * from './governmentId';
export * from './talentCategories';
