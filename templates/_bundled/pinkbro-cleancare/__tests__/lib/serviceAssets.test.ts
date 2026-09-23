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
  it('maps the five background / stage slots to the bundled original-page photos', () => {
    expect(Object.keys(SLOT_PHOTO).sort()).toEqual([
      'estimate_bg', 'hero_main', 'hero_sub', 'package_stage', 'why_stage',
    ]);
    expect(SLOT_PHOTO).toEqual({
      hero_main: 'images/hero-visual.webp',
      hero_sub: 'images/hero-shell.webp',
      why_stage: 'images/why-stage.webp',
      package_stage: 'images/package-stage.webp',
      estimate_bg: 'images/estimate-bg.webp',
    });
  });

  it('case_* slots have no bundled placeholder — 슬롯이 비면 사진을 깔지 않는다', () => {
    expect(slotPhotoFor('case_1', null)).toBeNull();
    expect(slotPhotoFor('case_4', { case_4: { url: null, alt: null } })).toBeNull();
  });

  it('prefers the uploaded slot url over the bundled asset — 업로드가 항상 이긴다', () => {
    expect(slotPhotoFor('hero_main', { hero_main: { url: '/up.webp', alt: 'a' } }))
      .toBe('/up.webp');
    expect(slotPhotoFor('hero_sub', { hero_sub: { url: '/shell.webp', alt: 'a' } }))
      .toBe('/shell.webp');
    expect(slotPhotoFor('case_3', { case_3: { url: '/c.webp', alt: null } }))
      .toBe('/c.webp');
  });

  it('falls back to the bundled asset url when the slot is empty', () => {
    expect(slotPhotoFor('hero_main', null))
      .toBe('/api/templates/assets/pinkbro-cleancare?file=images/hero-visual.webp');
    expect(slotPhotoFor('hero_sub', null))
      .toBe('/api/templates/assets/pinkbro-cleancare?file=images/hero-shell.webp');
    expect(slotPhotoFor('estimate_bg', { estimate_bg: { url: null, alt: null } }))
      .toBe('/api/templates/assets/pinkbro-cleancare?file=images/estimate-bg.webp');
    expect(slotPhotoFor('why_stage', { why_stage: { url: null, alt: null } }))
      .toBe('/api/templates/assets/pinkbro-cleancare?file=images/why-stage.webp');
    expect(slotPhotoFor('package_stage', { package_stage: { url: null, alt: null } }))
      .toBe('/api/templates/assets/pinkbro-cleancare?file=images/package-stage.webp');
  });

  it('returns null for a slot that has no bundled asset — 중립 폴백은 그때만 남는다', () => {
    expect(slotPhotoFor('case_5', null)).toBeNull();
    expect(slotPhotoFor('nope', {})).toBeNull();
  });
});