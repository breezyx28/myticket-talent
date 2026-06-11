import { baseApi } from '@/api/baseApi';
import { unwrapData } from '@/api/types/common';
import type {
  CreateTalentCategoryRequest,
  SyncTalentCategoriesRequest,
  SyncTalentCategoriesResponse,
  TalentCategory,
} from '@/api/types/talentCategory';

export const talentCategoriesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getTalentCategoriesReference: build.query<TalentCategory[], void>({
      query: () => ({ url: '/reference/talent-categories' }),
      transformResponse: (raw: unknown) =>
        unwrapData(raw as TalentCategory[] | { data: TalentCategory[] }) ?? [],
      providesTags: [{ type: 'TalentCategory', id: 'REFERENCE' }],
    }),
    getTalentCategories: build.query<TalentCategory[], void>({
      query: () => ({ url: '/talent-categories' }),
      transformResponse: (raw: unknown) =>
        unwrapData(raw as TalentCategory[] | { data: TalentCategory[] }) ?? [],
      providesTags: [{ type: 'TalentCategory', id: 'LIST' }],
    }),
    createTalentCategory: build.mutation<TalentCategory, CreateTalentCategoryRequest>({
      query: (body) => ({ url: '/talent-categories', method: 'POST', body }),
      transformResponse: (raw: unknown) => unwrapData(raw as TalentCategory | { data: TalentCategory })!,
      invalidatesTags: [{ type: 'TalentCategory', id: 'LIST' }, { type: 'TalentCategory', id: 'REFERENCE' }],
    }),
    syncTalentProfileCategories: build.mutation<
      SyncTalentCategoriesResponse,
      SyncTalentCategoriesRequest
    >({
      query: (body) => ({ url: '/me/talent-profile/categories', method: 'PUT', body }),
      transformResponse: (raw: unknown) =>
        unwrapData(raw as SyncTalentCategoriesResponse | { data: SyncTalentCategoriesResponse })!,
      invalidatesTags: ['TalentProfile'],
    }),
  }),
});

export const {
  useGetTalentCategoriesReferenceQuery,
  useGetTalentCategoriesQuery,
  useCreateTalentCategoryMutation,
  useSyncTalentProfileCategoriesMutation,
} = talentCategoriesApi;
