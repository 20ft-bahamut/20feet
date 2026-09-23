import React from 'react';
import { Div, Img, P, Span } from './basic';
import { slotPhotoFor } from '../lib/serviceAssets';
import { renderCopyText } from '../lib/copyText';
import { usePbRevealRef } from '../lib/reveal';
import type { CopyData, MediaSlots, SiteData } from '../lib/types';
import '../styles/Hero.css';

/**
 * 카피 렌더 함수는 `lib/copyText.tsx` 로 옮겼다 — copy 도메인 문자열을 내보내는
 * 모든 컴포넌트가 쓰는 공용 util 이다. 기존 import(`./Hero`)가 깨지지 않게
 * 여기서 재export 한다.
 */
export { renderCopyText } from '../lib/copyText';

export interface HeroProps {
    /** 사이트 기본 정보. null = 아직 로딩 중(스켈레톤). */
    site: SiteData | null;
    /** 페이지 카피. null = 아직 로딩 중(스켈레톤). */
    copy: CopyData | null;
    /** 미디어 슬롯 키 → 슬롯. null = 아직 로딩 중. */
    media: MediaSlots | null;
}

/**
 * Hero (#top).
 *
 * 3단 폴백 계약:
 *   - `site` 또는 `copy` 가 null → 로딩 스켈레톤 (data-testid="hero-skeleton")
 *   - `media.hero_main.url` 없음 → 번들 자리표시자 사진 (SLOT_PHOTO.hero_main)
 *   - 슬롯도 번들 자산도 없음 → 중립 CSS 폴백 (data-testid="hero-media-fallback")
 *   - 슬롯 URL 있음 → 그 URL (업로드가 항상 이긴다)
 *
 * 셸 배경(hero_sub 슬롯)은 원문 `.hero-shell::before` 스택의 사진 레이어와 같은 자리다
 * (원문 styles.css 67~70행 — 그라디언트 스크림 아래에 사진이 깔린다):
 *   - `media.hero_sub.url` 있음 → 그 URL (업로드가 항상 이긴다)
 *   - 슬롯 없음 → 번들 자리표시자 배경 (SLOT_PHOTO.hero_sub)
 *   - 둘 다 없음 → 배경 없음 (셸 베이스 컬러만 남는다)
 * 사진은 .pb-hero-shell 의 inline 배경, 스크림(::before)이 그 위, 콘텐츠(.pb-hero-grid,
 * z-index:1)가 그 위 — 원문과 같은 3단 순서다.
 *
 * 원문 hero-actions(CTA 2개 — `간편견적 문의하기` / `가격 · 예상견적 보기`)와
 * visual-bottom 의 `BRAND MESSAGE` 라벨은 copy 도메인 키
 * (hero_cta_primary / hero_cta_secondary / hero_visual_message_label)로 배선됐다.
 * 값이 없으면 그 CTA·라벨만 조용히 생략한다 — 리터럴로 대체하지 않는다.
 */
export function Hero({ site, copy, media }: HeroProps): React.ReactElement {
    // 리빌 ref — 원문 body.html 24·42·49행(hero-shell / hero-scope / hero-visual-clean).
    // 훅은 스켈레톤 early-return 앞에 호출한다(훅 순서 규칙). 스켈레톤에는 리빌을
    // 달지 않는다 — 콘텐츠가 도착해 노드가 채워질 때 관찰이 시작된다.
    const reveal = usePbRevealRef<HTMLDivElement>();
    if (site === null || copy === null) {
        return (
            <section className="pb-hero" data-testid="hero-skeleton">
                <div className="pb-wrap">
                    <Div className="pb-hero-shell">
                        <Div
                            className="pb-skeleton-block dark"
                            style={{ height: '100%', minHeight: 'inherit' }}
                        />
                    </Div>
                </div>
            </section>
        );
    }

    const headline = copy.hero_headline ?? '';
    const lead = copy.hero_lead;
    const pills = copy.hero_pills;
    const ctaPrimary = copy.hero_cta_primary;
    const ctaSecondary = copy.hero_cta_secondary;
    const heroSlot = media?.hero_main ?? null;
    // 슬롯 URL 이 있으면 그 URL, 없으면 번들 자리표시자 — 완성된 URL 이다.
    const slotUrl = slotPhotoFor('hero_main', media);
    // 셸 배경(hero_sub) — 슬롯 URL 우선, 없으면 번들 자리표시자(원문 셸 사진), 없으면 배경 생략.
    const shellUrl = slotPhotoFor('hero_sub', media);
    const shellStyle = shellUrl
        ? {
              backgroundImage: `url(${shellUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
          }
        : undefined;

    // visual 라벨은 copy 원문이 우선이고, 없으면 기존 사이트 영문명으로 폴백한다.
    const visualLabel = copy.hero_visual_label ?? site.brand_name_en;
    const visualMessageLabel = copy.hero_visual_message_label;
    const brandMessage = copy.hero_visual_brand_message ?? site.tagline;
    const visualBody = copy.hero_visual_body;
    const scope = copy.hero_scope;

    return (
        <section className="pb-hero" data-testid="hero">
            <div className="pb-wrap">
                {/* 원문 body.html 24행 — .hero-shell reveal */}
                <Div className="pb-hero-shell pb-reveal" ref={reveal('hero-shell')} style={shellStyle}>
                    <div className="pb-hero-grid">
                        <div className="pb-hero-copy">
                            <div className="pb-hero-copy-top">
                                {site.eyebrow && (
                                    <Span className="pb-eyebrow" style={{ color: '#ff9dc6' }}>
                                        {site.eyebrow}
                                    </Span>
                                )}
                                <h1 className="pb-display" style={{ marginTop: 24 }}>
                                    {renderCopyText(headline)}
                                </h1>
                                {lead && (
                                    <P className="pb-lead" style={{ marginTop: 24 }}>
                                        {renderCopyText(lead)}
                                    </P>
                                )}
                                {(ctaPrimary || ctaSecondary) && (
                                    <Div className="pb-hero-actions" data-testid="hero-actions">
                                        {ctaPrimary && (
                                            <a
                                                className="pb-btn pb-hero-cta--primary"
                                                data-testid="hero-cta-primary"
                                                href="#estimate"
                                            >
                                                {renderCopyText(ctaPrimary)}
                                            </a>
                                        )}
                                        {ctaSecondary && (
                                            <a
                                                className="pb-btn pb-hero-cta--soft"
                                                data-testid="hero-cta-secondary"
                                                href="#pricing"
                                            >
                                                {renderCopyText(ctaSecondary)}
                                            </a>
                                        )}
                                    </Div>
                                )}
                                {Array.isArray(pills) && pills.length > 0 && (
                                    <Div className="pb-hero-pills" data-testid="hero-pills">
                                        {pills.map((pill, index) => (
                                            <Span key={index}>{renderCopyText(pill)}</Span>
                                        ))}
                                    </Div>
                                )}
                            </div>

                            {/* 원문 body.html 42행 — .hero-scope reveal --delay:.08s */}
                            {Array.isArray(scope) && scope.length > 0 && (
                                <Div
                                    className="pb-hero-scope pb-reveal"
                                    ref={reveal('hero-scope')}
                                    style={{ '--pb-delay': '0.08s' } as React.CSSProperties}
                                    data-testid="hero-scope"
                                >
                                    {scope.map((item, index) => (
                                        <div key={`${item.no}-${index}`}>
                                            <small>{item.no}</small>
                                            <b>{renderCopyText(item.title)}</b>
                                            <span>{renderCopyText(item.body)}</span>
                                        </div>
                                    ))}
                                </Div>
                            )}
                        </div>

                        {/* 원문 body.html 49행 — .hero-visual-clean reveal right --delay:.08s */}
                        <Div
                            className="pb-hero-media pb-reveal pb-reveal--right"
                            ref={reveal('hero-visual')}
                            style={{ '--pb-delay': '0.08s' } as React.CSSProperties}
                            data-testid="hero-media"
                        >
                            {slotUrl ? (
                                <Img
                                    data-testid="hero-media-img"
                                    src={slotUrl}
                                    alt={heroSlot?.alt ?? ''}
                                />
                            ) : (
                                <Div
                                    className="pb-hero-media-fallback"
                                    data-testid="hero-media-fallback"
                                    aria-hidden="true"
                                />
                            )}
                            {visualLabel && (
                                <Div className="pb-hero-visual-label" data-testid="hero-visual-label">
                                    {renderCopyText(visualLabel)}
                                </Div>
                            )}
                            {(brandMessage || visualBody) && (
                                <Div className="pb-hero-visual-bottom">
                                    <div>
                                        {visualMessageLabel && (
                                            <span data-testid="hero-visual-message-label">
                                                {renderCopyText(visualMessageLabel)}
                                            </span>
                                        )}
                                        {brandMessage && <b>{renderCopyText(brandMessage)}</b>}
                                    </div>
                                    {visualBody && (
                                        <p data-testid="hero-visual-body">
                                            {renderCopyText(visualBody)}
                                        </p>
                                    )}
                                </Div>
                            )}
                        </Div>
                    </div>
                </Div>
            </div>
        </section>
    );
}

export default Hero;
