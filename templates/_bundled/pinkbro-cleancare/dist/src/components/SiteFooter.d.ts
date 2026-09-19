import { default as React } from 'react';
import { CopyData, SiteData } from '../lib/types';
export interface SiteFooterProps {
    site: SiteData | null;
    copy: CopyData | null;
}
/**
 * 사이트 푸터.
 *
 * 모든 문구는 props 로 받는다(COPY POLICY — 리터럴 금지):
 * 태그라인은 `site.tagline`, 저작권 문구는 `copy.footer_text`, 연락처 값은
 * `site.phone` / `site.kakao_channel` / `site.region` 에서 온다.
 * 소스 푸터의 서비스 목록 컬럼은 props 계약에 데이터원이 없어 렌더하지 않는다
 * (리포트의 미해결 항목 참조).
 */
export declare function SiteFooter({ site, copy }: SiteFooterProps): React.ReactElement;
