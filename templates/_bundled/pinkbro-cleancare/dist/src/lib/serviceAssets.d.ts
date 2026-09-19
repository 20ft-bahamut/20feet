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
