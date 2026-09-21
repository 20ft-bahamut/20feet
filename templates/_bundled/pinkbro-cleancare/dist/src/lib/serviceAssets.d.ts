import { MediaSlots } from './types';
/** 서비스 slug → 템플릿 자산 경로. public/images 기준. */
export declare const SERVICE_PHOTO: Record<string, string>;
/** 서비스 slug → 모듈 슬롯 키. MediaSlots 의 키 규약(services_*)과 일치한다. */
export declare const SERVICE_SLOT: Record<string, string>;
/**
 * 슬롯 URL 우선, 없으면 번들 템플릿 자산, 둘 다 없으면 null.
 * 반환값은 완성된 URL 이다 — 호출부에서 다시 templateAsset() 으로 감싸지 않는다.
 */
export declare function servicePhotoFor(slug: string, media: MediaSlots | null): string | null;
/**
 * 배경·스테이지·작업사례 커버 슬롯 키 → 템플릿 자산 경로. public/images 기준.
 *
 * 관리자가 슬롯에 사진을 올리기 전까지 그 자리를 채우는 번들 자리표시자다.
 * 값은 이미 승인된 서비스 사진 6장(SERVICE_PHOTO)을 재사용한다 — 새 자산을 만들지 않는다.
 *
 * `hero_sub` 는 모듈 슬롯 레지스트리에 있으나 현재 Hero 에 두 번째 비주얼이 없어
 * 소비되지 않는다. 슬롯이 업로드되면 그때 쓸 자리를 지켜 둔다.
 */
export declare const SLOT_PHOTO: Record<string, string>;
/**
 * 슬롯 URL 우선, 없으면 번들 템플릿 자산, 둘 다 없으면 null.
 * 반환값은 완성된 URL 이다 — 호출부에서 다시 templateAsset() 으로 감싸지 않는다.
 *
 * 관리자가 슬롯에 업로드한 이미지가 있으면 그 URL 이 이긴다 — 이 함수의 존재 이유다.
 */
export declare function slotPhotoFor(slotKey: string, media: MediaSlots | null): string | null;
