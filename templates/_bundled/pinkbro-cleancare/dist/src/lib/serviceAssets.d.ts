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
 * 배경·스테이지 슬롯 키 → 템플릿 자산 경로. public/images 기준.
 *
 * 관리자가 슬롯에 사진을 올리기 전까지 그 자리를 채우는 번들 자리표시자다.
 * 값은 원본 페이지가 쓰던 사진을 그대로 옮겨 온 webp 5장이다
 * (hero_main=우측 비주얼 544x663, hero_sub=히어로 셸 전체 배경 1280x791 —
 * _workspace/pinkbro/source/styles.css 67·101행의 두 Unsplash 핫링크 자리).
 *
 * `case_1..4` 는 일부러 없다 — 작업사례 커버는 관리자 업로드가 있을 때만 사진을 깔고,
 * 슬롯이 비면 중립 폴백을 남긴다 (원본도 사례 커버를 사진으로 채우지 않는다).
 */
export declare const SLOT_PHOTO: Record<string, string>;
/**
 * 슬롯 URL 우선, 없으면 번들 템플릿 자산, 둘 다 없으면 null.
 * 반환값은 완성된 URL 이다 — 호출부에서 다시 templateAsset() 으로 감싸지 않는다.
 *
 * 관리자가 슬롯에 업로드한 이미지가 있으면 그 URL 이 이긴다 — 이 함수의 존재 이유다.
 */
export declare function slotPhotoFor(slotKey: string, media: MediaSlots | null): string | null;
