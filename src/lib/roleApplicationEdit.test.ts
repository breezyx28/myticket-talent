import { describe, expect, it } from 'vitest';
import { canEditTalentApplication } from '@/lib/roleApplicationEdit';

describe('canEditTalentApplication', () => {
  it('allows draft and rejected', () => {
    expect(canEditTalentApplication('draft')).toBe(true);
    expect(canEditTalentApplication('rejected')).toBe(true);
  });

  it('blocks submitted and approved', () => {
    expect(canEditTalentApplication('submitted')).toBe(false);
    expect(canEditTalentApplication('approved')).toBe(false);
    expect(canEditTalentApplication(null)).toBe(false);
  });
});
