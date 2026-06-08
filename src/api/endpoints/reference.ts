import { baseApi } from '@/api/baseApi';
import type { SaudiRegionsResponse } from '@/api/types/reference';

export const referenceApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getSaudiRegions: build.query<SaudiRegionsResponse, void>({
      query: () => ({ url: '/reference/saudi-regions' }),
      providesTags: [{ type: 'SaudiRegion', id: 'LIST' }],
    }),
  }),
});

export const { useGetSaudiRegionsQuery } = referenceApi;
