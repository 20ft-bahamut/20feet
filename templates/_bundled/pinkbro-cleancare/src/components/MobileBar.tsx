import React from 'react';
import { telHref } from './SiteHeader';
import type { SiteData } from '../lib/types';
import '../styles/MobileBar.css';

export interface MobileBarProps {
  site: SiteData | null;
  /** 액션 라벨 오버라이드(생략 시 소스 원문 라벨 사용) */
  phoneLabel?: string;
  estimateLabel?: string;
  kakaoLabel?: string;
}

/**
 * 모바일 하단 고정바 — 소스의 3버튼(전화상담 / 간편견적 / 카카오문의).
 *
 * 라벨은 소스 `body.html` 의 `.mobile-bar` 원문 이식 값이며, 카카오 버튼 배경
 * `#FEE500` 은 브리프 지정대로 유지한다(MobileBar.css). 데스크톱에서는 CSS 로
 * 숨겨진다(source/styles.css 와 동일 동작).
 */
export function MobileBar({ site, phoneLabel, estimateLabel, kakaoLabel }: MobileBarProps): React.ReactElement {
  const phone = phoneLabel ?? '전화상담';
  const estimate = estimateLabel ?? '간편견적';
  const kakao = kakaoLabel ?? '카카오문의';

  return (
    <div className="pb-mobile-bar" data-testid="pb-mobile-bar">
      <a href={telHref(site?.phone)}>{phone}</a>
      <a href="#estimate">{estimate}</a>
      {site?.kakao_channel ? (
        <a href={site.kakao_channel} target="_blank" rel="noopener">
          {kakao}
        </a>
      ) : null}
    </div>
  );
}