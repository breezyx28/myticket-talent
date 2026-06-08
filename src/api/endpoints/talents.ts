import { baseApi } from '@/api/baseApi';
import type { Paginated, PaginationQuery, Slug } from '@/api/types/common';
import { unwrapData } from '@/api/types/common';
import type { Talent, TalentRating } from '@/api/types/talent';

export const talentsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getTalentBySlug: build.query<Talent, { slug: Slug }>({
      query: ({ slug }) => ({ url: `/talents/${encodeURIComponent(slug)}` }),
      transformResponse: (raw: Talent | { data: Talent }) =>
        unwrapData(raw) ?? (raw as Talent),
      providesTags: (_res, _err, arg) => [{ type: 'Rating', id: `talent:${arg.slug}` }],
    }),
    listTalentRatings: build.query<
      Paginated<TalentRating>,
      { slug: Slug } & PaginationQuery
    >({
      query: ({ slug, ...params }) => ({
        url: `/talents/${encodeURIComponent(slug)}/ratings`,
        params,
      }),
      providesTags: (_res, _err, arg) => [{ type: 'Rating', id: `talent-ratings:${arg.slug}` }],
    }),
  }),
});

export const {
  useGetTalentBySlugQuery,
  useListTalentRatingsQuery,
} = talentsApi;
