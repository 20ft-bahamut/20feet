import { describe, expect, it } from 'vitest';
import { SERVICE_PHOTO, SERVICE_SLOT, servicePhotoFor } from '../../src/lib/serviceAssets';

describe('serviceAssets', () => {
  it('maps all six services to a bundled template asset', () => {
    expect(Object.keys(SERVICE_PHOTO).sort()).toEqual([
      'air-care', 'awning-care', 'floor-care', 'glass-care', 'kitchen-care', 'sign-care',
    ]);
    for (const path of Object.values(SERVICE_PHOTO)) {
      expect(path).toMatch(/^images\/service-.*\.webp$/);
    }
  });

  it('maps all six services to a module slot key', () => {
    expect(Object.keys(SERVICE_SLOT).sort()).toEqual(Object.keys(SERVICE_PHOTO).sort());
    for (const key of Object.values(SERVICE_SLOT)) {
      expect(key).toMatch(/^services_/);
    }
  });

  it('prefers the uploaded slot url over the bundled asset', () => {
    expect(servicePhotoFor('floor-care', { services_floor: { url: '/up.webp', alt: 'a' } }))
      .toBe('/up.webp');
  });

  it('falls back to the bundled asset url when the slot is empty', () => {
    const expected = '/api/templates/assets/pinkbro-cleancare?file=images/service-floor-care.webp';
    expect(servicePhotoFor('floor-care', null)).toBe(expected);
    expect(servicePhotoFor('floor-care', { services_floor: { url: null, alt: null } })).toBe(expected);
  });

  it('returns null for an unknown slug with no slot', () => {
    expect(servicePhotoFor('nope', null)).toBeNull();
  });
});