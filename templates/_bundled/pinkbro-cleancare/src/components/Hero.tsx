import React from 'react';
import { Div, Img, P, Span } from './basic';
import type { CopyData, MediaSlots, SiteData } from '../lib/types';
import '../styles/Hero.css';

export interface HeroProps {
    /** 사이트 기본 정보. null = 아직 로딩 중(스켈레톤). */
    site: SiteData | null;
    /** 페이지 카피. null = 아직 로딩 중(스켈레톤). */
    copy: CopyData | null;
    /** 미디어 슬롯 키 → 슬롯. null = 아직 로딩 중. */
    media: MediaSlots | null;
}

/**
 * \n 으로 줄바꿈된 카피를 <br/> 로 렌더한다. COPY POLICY — 문구는 전부 props.
 */
function withLineBreaks(text: string): React.ReactNode[] {
    return text.split('\n').map((line, index) => (
        <React.Fragment key={index}>
            {index > 0 && <br />}
            {line}
        </React.Fragment>
    ));
}

/**
 * Hero (#top).
 *
 * 3단 폴백 계약:
 *   - `site` 또는 `copy` 가 null → 로딩 스켈레톤 (data-testid="hero-skeleton")
 *   - `media.hero_main.url` 없음 → 중립 CSS 폴백 (data-testid="hero-media-fallback")
 *   - URL 있음 → <img>
 *
 * 원문 마크업의 hero-actions(CTA 2개)·hero-scope(01/02/03 카드)·visual-bottom 보조 문구는
 * CopyData/SiteData 계약에 해당 필드가 없어 렌더하지 않는다 — 카피를 하드코딩하지 않기 위함.
 * 계약 확장은 리포트의 COPY REQUIRED 항목 참조.
 */
export function Hero({ site, copy, media }: HeroProps): React.ReactElement {
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
    const heroSlot = media?.hero_main ?? null;
    const slotUrl = heroSlot?.url ?? null;

    const headlineLines = headline.split('\n');

    return (
        <section className="pb-hero" data-testid="hero">
            <div className="pb-wrap">
                <Div className="pb-hero-shell">
                    <div className="pb-hero-grid">
                        <div className="pb-hero-copy">
                            <div className="pb-hero-copy-top">
                                {site.eyebrow && (
                                    <Span className="pb-eyebrow" style={{ color: '#ff9dc6' }}>
                                        {site.eyebrow}
                                    </Span>
                                )}
                                <h1 className="pb-display" style={{ marginTop: 24 }}>
                                    {headlineLines.map((line, index) => (
                                        <React.Fragment key={index}>
                                            {index > 0 && <br />}
                                            {index > 0 ? <em>{line}</em> : line}
                                        </React.Fragment>
                                    ))}
                                </h1>
                                {lead && (
                                    <P className="pb-lead" style={{ marginTop: 24 }}>
                                        {withLineBreaks(lead)}
                                    </P>
                                )}
                                {Array.isArray(pills) && pills.length > 0 && (
                                    <Div className="pb-hero-pills" data-testid="hero-pills">
                                        {pills.map((pill, index) => (
                                            <Span key={index}>{pill}</Span>
                                        ))}
                                    </Div>
                                )}
                            </div>
                        </div>

                        <Div className="pb-hero-media" data-testid="hero-media">
                            {slotUrl ? (
                                <Img src={slotUrl} alt={heroSlot?.alt ?? ''} />
                            ) : (
                                <Div
                                    className="pb-hero-media-fallback"
                                    data-testid="hero-media-fallback"
                                    aria-hidden="true"
                                />
                            )}
                            {site.brand_name_en && (
                                <Div className="pb-hero-visual-label">{site.brand_name_en}</Div>
                            )}
                            {site.tagline && (
                                <Div className="pb-hero-visual-bottom">
                                    <div>
                                        <b>{site.tagline}</b>
                                    </div>
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