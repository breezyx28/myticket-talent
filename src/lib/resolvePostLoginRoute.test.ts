import { describe, expect, it } from 'vitest';
import { resolvePostLoginRoute } from '@/lib/resolvePostLoginRoute';

describe('resolvePostLoginRoute', () => {
  it('sends organizer to access denied', () => {
    expect(
      resolvePostLoginRoute({
        role: 'organizer',
        hasTalentApplication: false,
        applicationStatus: null,
        hasTalentProfile: false,
      }),
    ).toBe('/access-denied');
  });

  it('sends vendor to access denied', () => {
    expect(
      resolvePostLoginRoute({
        role: 'vendor',
        hasTalentApplication: true,
        applicationStatus: 'approved',
        hasTalentProfile: false,
      }),
    ).toBe('/access-denied');
  });

  it('sends approved talent with profile to dashboard home', () => {
    expect(
      resolvePostLoginRoute({
        role: 'talent',
        hasTalentApplication: true,
        applicationStatus: 'approved',
        hasTalentProfile: true,
      }),
    ).toBe('/');
  });

  it('sends talent role without profile to provisioning status page', () => {
    expect(
      resolvePostLoginRoute({
        role: 'talent',
        hasTalentApplication: true,
        applicationStatus: 'approved',
        hasTalentProfile: false,
      }),
    ).toBe('/application/status');
  });

  it('sends guest without application to wizard', () => {
    expect(
      resolvePostLoginRoute({
        role: 'guest',
        hasTalentApplication: false,
        applicationStatus: null,
        hasTalentProfile: false,
      }),
    ).toBe('/application');
  });

  it('sends submitted application to status page', () => {
    expect(
      resolvePostLoginRoute({
        role: 'guest',
        hasTalentApplication: true,
        applicationStatus: 'submitted',
        hasTalentProfile: false,
      }),
    ).toBe('/application/status');
  });

  it('sends draft application to wizard', () => {
    expect(
      resolvePostLoginRoute({
        role: 'guest',
        hasTalentApplication: true,
        applicationStatus: 'draft',
        hasTalentProfile: false,
      }),
    ).toBe('/application');
  });

  it('sends rejected application to wizard', () => {
    expect(
      resolvePostLoginRoute({
        role: 'guest',
        hasTalentApplication: true,
        applicationStatus: 'rejected',
        hasTalentProfile: false,
      }),
    ).toBe('/application');
  });

  it('sends approved guest without profile to provisioning status page', () => {
    expect(
      resolvePostLoginRoute({
        role: 'guest',
        hasTalentApplication: true,
        applicationStatus: 'approved',
        hasTalentProfile: false,
      }),
    ).toBe('/application/status');
  });

  it('defaults unknown state to application wizard', () => {
    expect(
      resolvePostLoginRoute({
        role: 'guest',
        hasTalentApplication: true,
        applicationStatus: 'not_started',
        hasTalentProfile: false,
      }),
    ).toBe('/application');
  });
});
