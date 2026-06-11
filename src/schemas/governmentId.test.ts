import { describe, expect, it } from 'vitest';
import { governmentIdVerificationSchema } from '@/schemas/governmentId';

describe('governmentIdVerificationSchema', () => {
  it('requires document type and front image URL', async () => {
    await expect(
      governmentIdVerificationSchema.validate({
        document_type: 'national_id',
        front_image_url: 'https://cdn.example.com/front.jpg',
      }),
    ).resolves.toBeDefined();
  });

  it('rejects missing front image', async () => {
    await expect(
      governmentIdVerificationSchema.validate({
        document_type: 'passport',
      }),
    ).rejects.toThrow();
  });
});
