import { describe, expect, it } from 'vitest';
import {
  SERVICE_PHOTO,
  SERVICE_SLOT,
  SLOT_PHOTO,
  servicePhotoFor,
  slotPhotoFor,
} from '../../src/lib/serviceAssets';

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

describe('slotAssets', () => {
  it('maps every background / stage / case slot to a bundled template asset', () => {
    expect(Object.keys(SLOT_PHOTO).sort()).toEqual([
      'case_1', 'case_2', 'case_3', 'case_4',
      'estimate_bg', 'hero_main', 'hero_sub', 'package_stage', 'why_stage',
    ]);
    for (const path of Object.values(SLOT_PHOTO)) {
      expect(path).toMatch(/^images\/service-.*\.webp$/);
    }
  });

  it('reuses only the six approved service photos — 자리표시자는 새 자산을 만들지 않는다', () => {
    const approved = new Set(Object.values(SERVICE_PHOTO));
    for (const path of Object.values(SLOT_PHOTO)) {
      expect(approved.has(path)).toBe(true);
    }
  });

  it('prefers the uploaded slot url over the bundled asset — 업로드가 항상 이긴다', () => {
    expect(slotPhotoFor('hero_main', { hero_main: { url: '/up.webp', alt: 'a' } }))
      .toBe('/up.webp');
    expect(slotPhotoFor('case_3', { case_3: { url: '/c.webp', alt: null } }))
      .toBe('/c.webp');
  });

  it('falls back to the bundled asset url when the slot is empty', () => {
    expect(slotPhotoFor('hero_main', null))
      .toBe('/api/templates/assets/pinkbro-cleancare?file=images/service-kitchen-care.webp');
    expect(slotPhotoFor('estimate_bg', { estimate_bg: { url: null, alt: null } }))
      .toBe('/api/templates/assets/pinkbro-cleancare?file=images/service-sign-care.webp');
  });

  it('returns null for a slot that has no bundled asset — 중립 폴백은 그때만 남는다', () => {
    expect(slotPhotoFor('case_5', null)).toBeNull();
    expect(slotPhotoFor('nope', {})).toBeNull();
  });
});