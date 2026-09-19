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