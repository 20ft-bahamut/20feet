import React from 'react';
import { telHref } from './SiteHeader';
import { templateAsset } from '../lib/templateAsset';
import type { CopyData, SiteData } from '../lib/types';
import '../styles/SiteFooter.css';

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
export function SiteFooter({ site, copy }: SiteFooterProps): React.ReactElement {
  const hasContact = Boolean(site?.phone || site?.kakao_channel || site?.region);

  return (
    <footer className="pb-footer" data-testid="pb-footer">
      <div className="pb-footer-wrap">
        <div className="pb-footer-grid">
          <div className="pb-footer-brand">
            {site?.brand_name ? (
              <img
                className="pb-footer-logo"
                src={templateAsset('images/brand-logo.webp')}
                alt={site.brand_name}
              />
            ) : null}
            {site?.tagline ? (
              <p className="pb-footer-tagline">
                <strong>{site.tagline}</strong>
              </p>
            ) : null}
          </div>

          {hasContact ? (
            <div className="pb-footer-contact">
              {site?.phone ? (
                <a href={telHref(site.phone)}>{site.phone}</a>
              ) : null}
              {site?.kakao_channel ? (
                <a href={site.kakao_channel} target="_blank" rel="noopener">
                  {site.kakao_channel}
                </a>
              ) : null}
              {site?.region ? <span>{site.region}</span> : null}
            </div>
          ) : null}
        </div>

        {copy?.footer_text ? <div className="pb-copyright">{copy.footer_text}</div> : null}
      </div>
    </footer>
  );
}