import React from 'react';
import { telHref } from './SiteHeader';
import { templateAsset } from '../lib/templateAsset';
import { renderCopyText } from '../lib/copyText';
import type { CopyData, SiteData } from '../lib/types';
import '../styles/SiteFooter.css';

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
export function SiteFooter({ site, copy }: SiteFooterProps): React.ReactElement {
  const brandDesc = copy?.footer_brand_desc ?? null;

  // 원문 488행 — 연락처 3줄은 값이 site 도메인에, 라벨은 copy 도메인에 있다.
  const contactLines: React.ReactNode[] = [];
  if (site?.phone) {
    contactLines.push(
      <a key="phone" href={telHref(site.phone)}>
        {copy?.footer_contact_phone_label ? `${copy.footer_contact_phone_label} ` : null}
        {site.phone}
      </a>,
    );
  }
  if (site?.kakao_channel) {
    contactLines.push(
      <a key="kakao" href={site.kakao_channel} target="_blank" rel="noopener">
        {copy?.footer_contact_kakao_label ?? site.kakao_channel}
      </a>,
    );
  }
  if (site?.region) {
    contactLines.push(<React.Fragment key="region">{site.region}</React.Fragment>);
  }
  const hasContact = contactLines.length > 0;
  const hasContactCol = hasContact || Boolean(copy?.footer_contact_heading);

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
            {site?.tagline || brandDesc ? (
              <p className="pb-footer-tagline">
                {site?.tagline ? <strong>{site.tagline}</strong> : null}
                {brandDesc ? (
                  <>
                    <br />
                    <span data-testid="footer-brand-desc">{renderCopyText(brandDesc)}</span>
                  </>
                ) : null}
              </p>
            ) : null}
          </div>

          {copy?.footer_core_service_heading || copy?.footer_core_service ? (
            <div className="pb-footer-col" data-testid="pb-footer-col-core">
              {copy.footer_core_service_heading ? (
                <h4 data-testid="footer-core-service-heading">
                  {copy.footer_core_service_heading}
                </h4>
              ) : null}
              {copy.footer_core_service ? (
                <p data-testid="footer-core-service">{renderCopyText(copy.footer_core_service)}</p>
              ) : null}
            </div>
          ) : null}

          {copy?.footer_more_service_heading || copy?.footer_more_service ? (
            <div className="pb-footer-col" data-testid="pb-footer-more-col">
              {copy.footer_more_service_heading ? (
                <h4 data-testid="footer-more-service-heading">
                  {copy.footer_more_service_heading}
                </h4>
              ) : null}
              {copy.footer_more_service ? (
                <p data-testid="footer-more-service">{renderCopyText(copy.footer_more_service)}</p>
              ) : null}
            </div>
          ) : null}

          {hasContactCol ? (
            <div className="pb-footer-col" data-testid="pb-footer-contact-col">
              {copy?.footer_contact_heading ? (
                <h4 data-testid="footer-contact-heading">{copy.footer_contact_heading}</h4>
              ) : null}
              {hasContact ? (
                <p data-testid="footer-contact">
                  {contactLines.map((line, index) => (
                    <React.Fragment key={index}>
                      {index > 0 && <br />}
                      {line}
                    </React.Fragment>
                  ))}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        {copy?.footer_text ? (
          <div className="pb-copyright">{renderCopyText(copy.footer_text)}</div>
        ) : null}
      </div>
    </footer>
  );
}