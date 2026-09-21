import React from 'react';
import { Div, Img } from './basic';
import type { CopyData, MediaSlots } from '../lib/types';
import '../styles/AboutSection.css';

export interface AboutSectionProps {
    /** 페이지 카피. null = 아직 로딩 중(스켈레톤). */
    copy: CopyData | null;
    /** 미디어 슬롯 키 → 슬롯. null = 아직 로딩 중. `why_stage` 가 이 섹션의 스테이지 이미지다. */
    media: MediaSlots | null;
}

/**
 * About (원문 "Why Pinkbro" 섹션).
 *
 * 폴백 계약:
 *   - `copy` null → 로딩 스켈레톤 (data-testid="about-skeleton")
 *   - `media.why_stage.url` 없음 → 중립 CSS 폴백 (data-testid="about-media-fallback")
 *   - URL 있음 → <img>
 *   - `about_perspectives` null → 관점 카드 영역 미렌더(데이터 도착 대기)
 *   - `about_perspectives` [] → 카드 없이 빈 콘텐츠 열
 *   - 배열 → .pb-why-card 로 렌더
 *
 * 섹션 앵커(`#about`)는 컴포넌트가 아니라 레이아웃이 소유한다 — 섹션 id 를
 * 컴포넌트가 직접 달면 레이아웃과 중복 id 가 생긴다.
 *
 * 문구는 전부 copy props 에서 온다: stage 오버레이는 `about_stage_eyebrow`(눈금) +
 * `about_heading`(h3) + `about_message`(p), why-content 는 `about_side_eyebrow`(눈금) +
 * `about_side_heading`(h2) + 관점 카드. 두 눈금(`Why Pinkbro` / `Brand Perspective`)은
 * 원문 68·76행 그대로이며 모듈 COPY 키가 없던 동안 렌더되지 않았다 — 이제 값이 오면
 * 렌더하고 없으면 조용히 생략한다.
 */
export function AboutSection({ copy, media }: AboutSectionProps): React.ReactElement {
    if (copy === null) {
        return (
            <section className="pb-about" data-testid="about-skeleton">
                <div className="pb-wrap">
                    <Div className="pb-about-skeleton">
                        <Div className="pb-skeleton-block dark" />
                        <Div className="pb-skeleton-block" />
                    </Div>
                </div>
            </section>
        );
    }

    const heading = copy.about_heading;
    const message = copy.about_message;
    const stageEyebrow = copy.about_stage_eyebrow;
    const sideHeading = copy.about_side_heading;
    const sideEyebrow = copy.about_side_eyebrow;
    const perspectives = copy.about_perspectives;
    const stage = media?.why_stage ?? null;
    const stageUrl = stage?.url ?? null;

    return (
        <section className="pb-about" data-testid="about-section">
            <div className="pb-wrap pb-why-grid">
                <Div className="pb-why-stage">
                    {stageUrl ? (
                        <Img
                            className="pb-why-stage-media"
                            data-testid="about-media"
                            src={stageUrl}
                            alt={stage?.alt ?? ''}
                            loading="lazy"
                        />
                    ) : (
                        <Div
                            className="pb-why-stage-fallback"
                            data-testid="about-media-fallback"
                            aria-hidden="true"
                        />
                    )}
                    <Div className="pb-why-overlay">
                        {stageEyebrow && (
                            <div className="pb-why-eyebrow" data-testid="about-stage-eyebrow">
                                {stageEyebrow}
                            </div>
                        )}
                        {heading && <h3 data-testid="about-heading">{heading}</h3>}
                        {message && <p data-testid="about-message">{message}</p>}
                    </Div>
                </Div>

                <Div className="pb-why-content" data-testid="about-perspectives">
                    {/* 원문 .why-content > .section-head > .copy — 눈금(eyebrow)과 h2 를
                        한 덩어리로 묶어 카드와의 간격을 grid gap 18px 로 유지한다. */}
                    <Div className="pb-why-copy">
                        {sideEyebrow && (
                            <div className="pb-why-side-eyebrow" data-testid="about-side-eyebrow">
                                {sideEyebrow}
                            </div>
                        )}
                        {sideHeading && (
                            <h2 className="pb-why-heading" data-testid="about-side-heading">
                                {sideHeading}
                            </h2>
                        )}
                    </Div>
                    {Array.isArray(perspectives) &&
                        perspectives.map((perspective, index) => (
                            <Div className="pb-why-card" key={index} data-testid="about-perspective">
                                <b>{perspective.title}</b>
                                <p>{perspective.body}</p>
                            </Div>
                        ))}
                </Div>
            </div>
        </section>
    );
}

export default AboutSection;