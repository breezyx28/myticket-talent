import { describe, expect, it } from 'vitest';
import { declineEngagementSchema, engagementMessageSchema } from '@/schemas/engagement';

describe('engagementMessageSchema', () => {
  it('accepts a non-empty message', async () => {
    await expect(engagementMessageSchema.validate({ body: 'Hello organizer' })).resolves.toMatchObject({
      body: 'Hello organizer',
    });
  });

  it('rejects empty messages', async () => {
    await expect(engagementMessageSchema.validate({ body: '   ' })).rejects.toThrow();
  });

  it('rejects invalid attachment URLs', async () => {
    await expect(
      engagementMessageSchema.validate({ body: 'See file', attachment_url: 'not-a-url' }),
    ).rejects.toThrow();
  });
});

describe('declineEngagementSchema', () => {
  it('allows optional decline reason', async () => {
    await expect(declineEngagementSchema.validate({})).resolves.toEqual({});
  });

  it('rejects overly long reasons', async () => {
    await expect(declineEngagementSchema.validate({ reason: 'x'.repeat(501) })).rejects.toThrow();
  });
});
