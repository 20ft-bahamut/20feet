import { default as React } from 'react';
import { CopyData, SiteData } from '../lib/types';
export interface SiteFooterProps {
    site: SiteData | null;
    copy: CopyData | null;
}
/**
 * 사이트 푸터 — source/body.html 471-493행의 4컬럼 구조
 * (.footer-brand + .footer-col ×3 + .copyright).
 *
 * 모든 문구는 props 로 받는다(COPY POLICY — 리터럴 금지):
 * - brand: 태그라인 `site.tagline`, 브랜드 소개 `copy.footer_brand_desc`
 * - Core Service: 제목 `copy.footer_core_service_heading`, 항목 `copy.footer_core_service`
 * - More Service: 제목 `copy.footer_more_service_heading`, 항목 `copy.footer_more_service`
 *   (항목은 원문 `<br>` 이 `\n` 으로 남은 스칼라 문구 — renderCopyText 가 `<br>` 로 렌더한다)
 * - Contact: 제목 `copy.footer_contact_heading`, 라벨은 `copy.footer_contact_phone_label`
 *   / `copy.footer_contact_kakao_label`, 연락처 값은
 *   `site.phone` / `site.kakao_channel` / `site.region` 에서 온다
 * - 저작권 문구는 `copy.footer_text`
 *
 * Contact 라벨 키가 비면 라벨 없이 값만 렌더한다 — 값은 site 도메인 데이터라
 * 리터럴로 대체하지 않는다(MobileBar 의 copy 라벨 + site 값 계약과 같다).
 */
export declare function SiteFooter({ site, copy }: SiteFooterProps): React.ReactElement;
