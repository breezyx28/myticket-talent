import { describe, expect, it } from 'vitest';
import {
  getTalentCityId,
  getTalentContactEmail,
  getTalentContactPhone,
  getTalentLiveProfileImageUrl,
  getTalentProfileImageUrl,
  getTalentRegionId,
  getTalentStageName,
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

  it('falls back to avatar_url when profile image fields are empty', () => {
    expect(
      getTalentLiveProfileImageUrl({
        avatar_url: 'https://cdn/avatar.jpg',
      }),
    ).toBe('https://cdn/avatar.jpg');
  });

  it('resolves live profile image alias', () => {
    expect(
      getTalentLiveProfileImageUrl({
        profile_image: 'https://cdn/live.jpg',
        profile_image_url: 'https://cdn/old.jpg',
      }),
    ).toBe('https://cdn/live.jpg');
  });

  it('resolves stage name from profile or application', () => {
    expect(getTalentStageName({ stage_name: 'Live Name' }, { id: 1, stage_name: 'App Name' })).toBe(
      'Live Name',
    );
    expect(getTalentStageName({ stage_name: '' }, { id: 1, stage_name: 'App Name' })).toBe('App Name');
    expect(getTalentStageName({ stage_name: ' ' }, null)).toBe('');
  });

  it('reads contact fields from application', () => {
    expect(getTalentContactEmail({ id: 1, contact_email: 'a@b.com' })).toBe('a@b.com');
    expect(getTalentContactPhone({ id: 1, contact_phone: '+966500000000' })).toBe('+966500000000');
  });

  it('maps region and city aliases', () => {
    expect(getTalentRegionId({ id: 1, saudi_region_id: 2 })).toBe(2);
    expect(getTalentRegionId({ id: 1, region_id: 3 })).toBe(3);
    expect(getTalentCityId({ id: 1, city: 4 })).toBe(4);
    expect(getTalentCityId({ id: 1, city_id: 5 })).toBe(5);
  });
});
