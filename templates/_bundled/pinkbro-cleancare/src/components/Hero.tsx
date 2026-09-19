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
 * 카피 원문을 React 노드로 렌더한다 (COPY POLICY — 문구는 전부 props).
 *
 * 시더가 저장한 값에는 원문 마크업이 그대로 남아 있다:
 *   - `\n`  : 원문 `<br>` (추출기가 보존)
 *   - `<em>` / `<strong>` : 원문 인라인 강조
 * 태그를 지우지도, 문자열로 노출하지도 않고 해당 요소로 렌더한다.
 * 여기서 다루는 마크업은 이 3종뿐이며 별도 템플릿 엔진을 쓰지 않는다.
 */
const EMPHASIS = /(<em>[\s\S]*?<\/em>|<strong>[\s\S]*?<\/strong>)/g;
const EMPHASIS_TAG = /^<(em|strong)>([\s\S]*)<\/\1>$/;

function renderInline(line: string, keyPrefix: string): React.ReactNode[] {
    return line
        .split(EMPHASIS)
        .filter((part) => part !== '')
        .map((part, index) => {
            const match = EMPHASIS_TAG.exec(part);
            if (!match) {
                return part;
            }
            const Tag = match[1] === 'em' ? 'em' : 'strong';
            return <Tag key={`${keyPrefix}-${index}`}>{match[2]}</Tag>;
        });
}

export function renderCopyText(text: string): React.ReactNode[] {
    return text.split('\n').map((line, index) => (
        <React.Fragment key={index}>
            {index > 0 && <br />}
            {renderInline(line, `l${index}`)}
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
 * 원문 hero-actions(CTA 2개: `간편견적 문의하기` / `가격 · 예상견적 보기`)와
 * visual-bottom 의 `BRAND MESSAGE` 라벨은 copy 도메인에 키가 없어 렌더하지 않는다 —
 * 카피 하드코딩 금지(COPY POLICY). 리포트의 COPY REQUIRED 항목 참조.
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

    // visual 라벨은 copy 원문이 우선이고, 없으면 기존 사이트 영문명으로 폴백한다.
    const visualLabel = copy.hero_visual_label ?? site.brand_name_en;
    const brandMessage = copy.hero_visual_brand_message ?? site.tagline;
    const visualBody = copy.hero_visual_body;
    const scope = copy.hero_scope;

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
                                    {renderCopyText(headline)}
                                </h1>
                                {lead && (
                                    <P className="pb-lead" style={{ marginTop: 24 }}>
                                        {renderCopyText(lead)}
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

                            {Array.isArray(scope) && scope.length > 0 && (
                                <Div className="pb-hero-scope" data-testid="hero-scope">
                                    {scope.map((item, index) => (
                                        <div key={`${item.no}-${index}`}>
                                            <small>{item.no}</small>
                                            <b>{item.title}</b>
                                            <span>{item.body}</span>
                                        </div>
                                    ))}
                                </Div>
                            )}
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
                            {visualLabel && (
                                <Div className="pb-hero-visual-label" data-testid="hero-visual-label">
                                    {visualLabel}
                                </Div>
                            )}
                            {(brandMessage || visualBody) && (
                                <Div className="pb-hero-visual-bottom">
                                    <div>
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
