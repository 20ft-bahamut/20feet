import React from 'react';
import { templateAsset } from '../lib/templateAsset';
import type { MediaSlots, SiteData } from '../lib/types';
import '../styles/SiteHeader.css';

/**
 * 소스 `body.html` 의 `<header>` 앵커 — 브리프에서 변경 금지로 고정된 값.
 * 라벨은 소스의 소문자 표기를 그대로 쓴다.
 */
const NAV_ITEMS = ['about', 'service', 'package', 'pricing', 'projects', 'faq', 'estimate'] as const;

/**
 * 소스 원문 헤더 CTA 라벨(source/body.html 원문 이식).
 * 컴포넌트 리터럴이 아니라 소스 카피 이관 값이다 — 관리자 copy 로 옮길 수
 * 있게 optional props 로도 받는다(기본값은 소스 원문).
 */
export interface SiteHeaderProps {
  site: SiteData | null;
  media: MediaSlots | null;
  /** CTA 라벨 오버라이드(생략 시 소스 원문 라벨 사용) */
  estimateLabel?: string;
  mobileEstimateLabel?: string;
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
export function SiteHeader({ site, media: _media, estimateLabel, mobileEstimateLabel }: SiteHeaderProps): React.ReactElement {
  const estimate = estimateLabel ?? '간편견적 문의';
  const mobileEstimate = mobileEstimateLabel ?? '간편견적';

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
            <a className="pb-btn pb-btn-ghost" href={telHref(site.phone)}>
              {site.phone}
            </a>
          ) : null}
          <a className="pb-btn pb-btn-dark" href="#estimate">
            {estimate}
          </a>
          <a className="pb-mobile-link" href="#estimate">
            {mobileEstimate}
          </a>
        </div>
      </div>
    </header>
  );
}