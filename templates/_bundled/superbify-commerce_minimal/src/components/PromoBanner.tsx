import React from 'react';
import { A, Div, Span } from './basic';
import { resolveSlotImage } from './imageSlots';
import { demoAssets } from './demoAssets';

export interface PromoBannerProps {
    eyebrow?: string;
    title?: string;
    description?: string;
    ctaLabel?: string;
    ctaHref?: string;
    className?: string;
    mediaSlot?: string;
    /** Override the visual asset directly. */
    mediaSrc?: string;
    /** Visual variant. 'split' = image left + type right. */
    layout?: 'split' | 'dark';
}

/**
 * Lifestyle feature split banner. Used as the trailing home section.
 * Renders a media-anchored editorial card instead of a hard-coded dark block.
 */
export function PromoBanner({
    eyebrow,
    title,
    description,
    ctaLabel,
    ctaHref,
    className,
    mediaSlot = 'hero-mood-3',
    mediaSrc,
    layout = 'split',
}: PromoBannerProps): React.ReactElement {
    const src = mediaSrc ?? demoAssets.promo ?? resolveSlotImage(mediaSlot);
    if (layout === 'dark') {
        return (
            <Div
                className={className}
                style={{
                    position: 'relative',
                    display: 'grid',
                    gridTemplateColumns: '1fr',
                    gap: 'var(--scm-spacing-md, 1rem)',
                    alignItems: 'center',
                    padding: 'var(--scm-spacing-lg, 1.5rem)',
                    borderRadius: 'var(--scm-radius, 8px)',
                    backgroundColor: 'var(--scm-charcoal, #26221E)',
                    color: 'var(--scm-text-inverse, #FAF8F3)',
                    overflow: 'hidden',
                }}
                data-testid="promo-banner"
                data-variant="dark"
            >
                <Div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--scm-spacing-2xs, 0.25rem)',
                    }}
                >
                    {eyebrow ? (
                        <Span
                            style={{
                                fontFamily: 'var(--scm-font-body, system-ui)',
                                fontSize: '0.75rem',
                                color: 'var(--scm-wood, #C9B08D)',
                                letterSpacing: '0.12em',
                                textTransform: 'uppercase',
                                fontWeight: 600,
                            }}
                        >
                            {eyebrow}
                        </Span>
                    ) : null}
                    {title ? (
                        <Span
                            style={{
                                fontFamily: 'var(--scm-font-display, system-ui)',
                                fontSize: '1.25rem',
                                fontWeight: 600,
                            }}
                        >
                            {title}
                        </Span>
                    ) : null}
                    {description ? (
                        <Span
                            style={{
                                fontFamily: 'var(--scm-font-body, system-ui)',
                                fontSize: '0.875rem',
                                opacity: 0.85,
                            }}
                        >
                            {description}
                        </Span>
                    ) : null}
                </Div>
                {ctaLabel && ctaHref ? (
                    <Div>
                        <A
                            href={ctaHref}
                            data-scm-interactive
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                minHeight: 'var(--scm-touch-min, 44px)',
                                padding: '0 var(--scm-spacing-md, 1rem)',
                                borderRadius: 'var(--scm-radius, 8px)',
                                backgroundColor: 'var(--scm-paper, #FAF8F3)',
                                color: 'var(--scm-text-primary, #26221E)',
                                textDecoration: 'none',
                                fontFamily: 'var(--scm-font-body, system-ui)',
                                fontSize: '0.9375rem',
                                fontWeight: 600,
                            }}
                        >
                            {ctaLabel}
                        </A>
                    </Div>
                ) : null}
            </Div>
        );
    }
    return (
        <Div
            className={className}
            style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, .9fr)',
                gap: 'var(--scm-spacing-xl, 2.5rem)',
                alignItems: 'stretch',
                backgroundColor: 'var(--scm-bg-secondary, #F4F0E6)',
                borderRadius: 'var(--scm-radius, 8px)',
                overflow: 'hidden',
            }}
            data-testid="promo-banner"
            data-variant="split"
        >
            <Div
                aria-hidden
                style={{
                    aspectRatio: '5 / 4',
                    backgroundColor: 'var(--scm-bg-secondary, #F4F0E6)',
                    minHeight: '260px',
                }}
            >
                <img
                    src={src}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
            </Div>
            <Div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    gap: 'var(--scm-spacing-md, 1rem)',
                    padding: 'var(--scm-spacing-xl, 2.5rem)',
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
                {title ? (
                    <h2
                        style={{
                            fontFamily: 'var(--scm-font-display, system-ui)',
                            fontSize: 'clamp(1.625rem, 3vw, 2.25rem)',
                            fontWeight: 600,
                            lineHeight: 1.18,
                            letterSpacing: '-0.015em',
                            color: 'var(--scm-text-primary, #26221E)',
                            margin: 0,
                            maxWidth: '20ch',
                            whiteSpace: 'pre-line',
                        }}
                    >
                        {title}
                    </h2>
                ) : null}
                {description ? (
                    <p
                        style={{
                            fontFamily: 'var(--scm-font-body, system-ui)',
                            fontSize: '0.9375rem',
                            lineHeight: 1.75,
                            color: 'var(--scm-text-body, #4A4643)',
                            margin: 0,
                            maxWidth: '52ch',
                        }}
                    >
                        {description}
                    </p>
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
                            marginTop: 'var(--scm-spacing-2xs, 0.25rem)',
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

export default PromoBanner;
