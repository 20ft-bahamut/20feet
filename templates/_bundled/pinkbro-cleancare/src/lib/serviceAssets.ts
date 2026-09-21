import { templateAsset } from './templateAsset';
import type { MediaSlots } from './types';

/** 서비스 slug → 템플릿 자산 경로. public/images 기준. */
export const SERVICE_PHOTO: Record<string, string> = {
  'floor-care': 'images/service-floor-care.webp',
  'glass-care': 'images/service-glass-care.webp',
  'awning-care': 'images/service-awning-care.webp',
  'sign-care': 'images/service-sign-care.webp',
  'kitchen-care': 'images/service-kitchen-care.webp',
  'air-care': 'images/service-air-care.webp',
};

/** 서비스 slug → 모듈 슬롯 키. MediaSlots 의 키 규약(services_*)과 일치한다. */
export const SERVICE_SLOT: Record<string, string> = {
  'floor-care': 'services_floor',
  'glass-care': 'services_glass',
  'awning-care': 'services_awning',
  'sign-care': 'services_sign',
  'kitchen-care': 'services_kitchen',
  'air-care': 'services_air',
};

/**
 * 슬롯 URL 우선, 없으면 번들 템플릿 자산, 둘 다 없으면 null.
 * 반환값은 완성된 URL 이다 — 호출부에서 다시 templateAsset() 으로 감싸지 않는다.
 */
export function servicePhotoFor(slug: string, media: MediaSlots | null): string | null {
  const slotKey = SERVICE_SLOT[slug];
  const slotUrl = slotKey ? media?.[slotKey]?.url ?? null : null;
  if (slotUrl) return slotUrl;

  const bundled = SERVICE_PHOTO[slug];
  return bundled ? templateAsset(bundled) : null;
}

/**
 * 배경·스테이지·작업사례 커버 슬롯 키 → 템플릿 자산 경로. public/images 기준.
 *
 * 관리자가 슬롯에 사진을 올리기 전까지 그 자리를 채우는 번들 자리표시자다.
 * 값은 이미 승인된 서비스 사진 6장(SERVICE_PHOTO)을 재사용한다 — 새 자산을 만들지 않는다.
 *
 * `hero_sub` 는 모듈 슬롯 레지스트리에 있으나 현재 Hero 에 두 번째 비주얼이 없어
 * 소비되지 않는다. 슬롯이 업로드되면 그때 쓸 자리를 지켜 둔다.
 */
export const SLOT_PHOTO: Record<string, string> = {
  hero_main: 'images/service-kitchen-care.webp',
  hero_sub: 'images/service-glass-care.webp',
  why_stage: 'images/service-floor-care.webp',
  package_stage: 'images/service-awning-care.webp',
  estimate_bg: 'images/service-sign-care.webp',
  case_1: 'images/service-floor-care.webp',
  case_2: 'images/service-glass-care.webp',
  case_3: 'images/service-kitchen-care.webp',
  case_4: 'images/service-air-care.webp',
};

/**
 * 슬롯 URL 우선, 없으면 번들 템플릿 자산, 둘 다 없으면 null.
 * 반환값은 완성된 URL 이다 — 호출부에서 다시 templateAsset() 으로 감싸지 않는다.
 *
 * 관리자가 슬롯에 업로드한 이미지가 있으면 그 URL 이 이긴다 — 이 함수의 존재 이유다.
 */
export function slotPhotoFor(slotKey: string, media: MediaSlots | null): string | null {
  const slotUrl = media?.[slotKey]?.url ?? null;
  if (slotUrl) return slotUrl;

  const bundled = SLOT_PHOTO[slotKey];
  return bundled ? templateAsset(bundled) : null;
}