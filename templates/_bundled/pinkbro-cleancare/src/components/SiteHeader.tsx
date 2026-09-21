import React from 'react';
import { templateAsset } from '../lib/templateAsset';
import type { CopyData, MediaSlots, SiteData } from '../lib/types';
import '../styles/SiteHeader.css';

/**
 * 소스 `body.html` 의 `<header>` 앵커 — 브리프에서 변경 금지로 고정된 값.
 * 라벨은 소스의 소문자 표기를 그대로 쓴다.
 */
const NAV_ITEMS = ['about', 'service', 'package', 'pricing', 'projects', 'faq', 'estimate'] as const;

export interface SiteHeaderProps {
  site: SiteData | null;
  media: MediaSlots | null;
  /**
   * 페이지 카피(null = 아직 로딩 중). CTA 라벨은 원문 그대로 copy 도메인에서 온다 —
   * 데스크톱 CTA 는 `header_cta`(원문 15행), 좁은 화면용 `.mobile-link` 는
   * `mobile_cta_estimate`(원문 16행, 모바일바 498행과 같은 문자열)다.
   * 값이 없으면 그 링크만 조용히 생략한다(리터럴 대체 금지).
   */
  copy: CopyData | null;
}

/**
 * 전화번호에서 하이픈 등 숫자·국가번호·특수 다이얼 문자 외를 제거해 tel: href 를 만든다.
 * 비어 있으면 페이지 내 이동 없는 `#` 을 돌려준다.
 */
export function telHref(phone: string | null | undefined): string {
  if (!phone) return '#';
  const digits = phone.replace(/[^0-9+*#]/g, '');
  return digits ? `tel:${digits}` : '#';
}

/**
 * 상단 고정 헤더.
 *
 * 로고는 모듈 미디어 슬롯이 아니라 브랜드 고정 템플릿 자산이다
 * (스펙 5.4 — templateAsset('images/brand-logo.webp')). `media` 는 계약
 * 유지를 위해 받지만 로고에는 쓰지 않는다.
 */
export function SiteHeader({ site, media: _media, copy }: SiteHeaderProps): React.ReactElement {
  const estimate = copy?.header_cta ?? null;
  const mobileEstimate = copy?.mobile_cta_estimate ?? null;

  return (
    <header className="pb-header" data-testid="pb-header">
      <div className="pb-nav">
        {site?.brand_name ? (
          <a className="pb-brand" href="#top" aria-label={site.brand_name}>
            <img src={templateAsset('images/brand-logo.webp')} alt={site.brand_name} />
          </a>
        ) : (
          <a className="pb-brand" href="#top" />
        )}

        <nav className="pb-nav-links" aria-label="주요 메뉴">
          {NAV_ITEMS.map((id) => (
            <a key={id} href={`#${id}`}>
              {id}
            </a>
          ))}
        </nav>

        <div className="pb-nav-cta">
          {site?.phone ? (
            <a className="pb-btn pb-btn--ghost" href={telHref(site.phone)}>
              {site.phone}
            </a>
          ) : null}
          {estimate !== null && (
            <a className="pb-btn pb-btn--dark" data-testid="header-cta" href="#estimate">
              {estimate}
            </a>
          )}
          {mobileEstimate !== null && (
            <a className="pb-mobile-link" data-testid="header-mobile-cta" href="#estimate">
              {mobileEstimate}
            </a>
          )}
        </div>
      </div>
    </header>
  );
}