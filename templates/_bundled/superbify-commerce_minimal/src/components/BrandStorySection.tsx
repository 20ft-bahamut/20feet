import React from 'react';
import { A, Div, H2, P, Span } from './basic';
import { resolveSlotImage } from './imageSlots';
import { demoAssets } from './demoAssets';

export interface BrandStorySectionProps {
    eyebrow?: string;
    heading?: string;
    body?: string;
    ctaLabel?: string;
    ctaHref?: string;
    className?: string;
    /** Slot id of a side image. */
    mediaSlot?: string;
    /** Override the side image directly with a bundled asset URL. */
    mediaSrc?: string;
    /** Visual variant. 'split' = image+text 2-col (default). 'stacked' = type only. */
    layout?: 'split' | 'stacked';
}

export function BrandStorySection({
    eyebrow,
    heading,
    body,
    ctaLabel,
    ctaHref,
    className,
    mediaSlot = 'hero-mood-1',
    mediaSrc,
    layout = 'split',
}: BrandStorySectionProps): React.ReactElement {
    const src = mediaSrc ?? demoAssets.brandStory ?? resolveSlotImage(mediaSlot);
    const isSplit = layout === 'split';
    return (
        <Div
            className={className}
            style={{
                display: 'grid',
                gridTemplateColumns: isSplit ? 'minmax(0, 1.05fr) minmax(0, 0.95fr)' : '1fr',
                gap: isSplit ? 'clamp(2rem, 4vw, 4rem)' : 0,
                alignItems: 'center',
            }}
            data-testid="brand-story-section"
        >
            {isSplit ? (
                <Div
                    style={{
                        aspectRatio: '4 / 5',
                        backgroundColor: 'var(--scm-bg-secondary, #F4F0E6)',
                        borderRadius: 'var(--scm-radius, 4px)',
                        overflow: 'hidden',
                    }}
                    aria-hidden
                >
                    <img
                        src={src}
                        alt=""
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                </Div>
            ) : null}
            <Div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--scm-spacing-md, 1rem)',
                }}
            >
                {eyebrow ? (
                    <Span
                        style={{
                            fontFamily: 'var(--scm-font-body, system-ui)',
                            fontSize: '0.75rem',
                            color: 'var(--scm-wood-dark, #A8916F)',
                            letterSpacing: '0.18em',
                            textTransform: 'uppercase',
                            fontWeight: 600,
                        }}
                    >
                        {eyebrow}
                    </Span>
                ) : null}
                <span
                    style={{
                        display: 'block',
                        width: '48px',
                        height: '1px',
                        backgroundColor: 'var(--scm-wood, #C9B08D)',
                    }}
                    aria-hidden
                />
                {heading ? (
                    <H2
                        style={{
                            fontFamily: 'var(--scm-font-display, system-ui)',
                            fontSize: 'clamp(1.625rem, 3.2vw, 2.25rem)',
                            fontWeight: 600,
                            letterSpacing: '-0.015em',
                            lineHeight: 1.15,
                            color: 'var(--scm-text-primary, #26221E)',
                            margin: 0,
                            maxWidth: '20ch',
                        }}
                    >
                        {heading}
                    </H2>
                ) : null}
                {body ? (
                    <P
                        style={{
                            fontFamily: 'var(--scm-font-body, system-ui)',
                            fontSize: '0.9375rem',
                            color: 'var(--scm-text-body, #4A4643)',
                            lineHeight: 1.85,
                            margin: 0,
                            maxWidth: '52ch',
                        }}
                    >
                        {body}
                    </P>
                ) : null}
                {ctaLabel && ctaHref ? (
                    <A
                        href={ctaHref}
                        data-scm-interactive
                        style={{
                            alignSelf: 'flex-start',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 'var(--scm-spacing-2xs, 0.25rem)',
                            paddingBlock: 'var(--scm-spacing-xs, 0.5rem)',
                            marginTop: 'var(--scm-spacing-xs, 0.5rem)',
                            color: 'var(--scm-text-primary, #26221E)',
                            textDecoration: 'none',
                            borderBottom: '1px solid var(--scm-charcoal, #26221E)',
                            fontFamily: 'var(--scm-font-body, system-ui)',
                            fontSize: '0.9375rem',
                            fontWeight: 600,
                        }}
                    >
                        <span>{ctaLabel}</span>
                        <span aria-hidden style={{ marginLeft: 4 }}>→</span>
                    </A>
                ) : null}
            </Div>
        </Div>
    );
}

export default BrandStorySection;
