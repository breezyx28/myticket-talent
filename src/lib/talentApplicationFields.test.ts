import { describe, expect, it } from 'vitest';
import {
  getTalentCityId,
  getTalentLiveProfileImageUrl,
  getTalentProfileImageUrl,
  getTalentRegionId,
} from '@/lib/talentApplicationFields';

describe('talentApplicationFields', () => {
  it('prefers profile_image alias over profile_image_url', () => {
    expect(
      getTalentProfileImageUrl({
        id: 1,
        profile_image: 'https://cdn/a.jpg',
        profile_image_url: 'https://cdn/b.jpg',
      }),
    ).toBe('https://cdn/a.jpg');
  });

  it('falls back to profile_image_url', () => {
    expect(
      getTalentProfileImageUrl({
        id: 1,
        profile_image_url: 'https://cdn/b.jpg',
      }),
    ).toBe('https://cdn/b.jpg');
  });

  it('resolves live profile image alias', () => {
    expect(
      getTalentLiveProfileImageUrl({
        profile_image: 'https://cdn/live.jpg',
        profile_image_url: 'https://cdn/old.jpg',
      }),
    ).toBe('https://cdn/live.jpg');
  });

  it('maps region and city aliases', () => {
    expect(getTalentRegionId({ id: 1, saudi_region_id: 2 })).toBe(2);
    expect(getTalentRegionId({ id: 1, region_id: 3 })).toBe(3);
    expect(getTalentCityId({ id: 1, city: 4 })).toBe(4);
    expect(getTalentCityId({ id: 1, city_id: 5 })).toBe(5);
  });
});
