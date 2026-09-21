import { default as React } from 'react';
import { CopyData, SiteData } from '../lib/types';
export interface MobileBarProps {
    site: SiteData | null;
    /**
     * 페이지 카피(null = 아직 로딩 중). 세 라벨은 원문 `.mobile-bar`
     * (body.html 497~499행) 그대로 copy 도메인에서 온다 —
     * `mobile_cta_phone` / `mobile_cta_estimate` / `mobile_cta_kakao`.
     * 값이 없으면 그 버튼만 조용히 생략한다(리터럴 대체 금지).
     */
    copy: CopyData | null;
}
/**
 * 모바일 하단 고정바 — 소스의 3버튼(전화상담 / 간편견적 / 카카오문의).
 *
 * 라벨은 copy 도메인에서 오고, 카카오 버튼 배경 `#FEE500` 은 브리프 지정대로
 * 유지한다(MobileBar.css). 데스크톱에서는 CSS 로 숨겨진다(source/styles.css 와 동일 동작).
 */
export declare function MobileBar({ site, copy }: MobileBarProps): React.ReactElement;
export default MobileBar;
