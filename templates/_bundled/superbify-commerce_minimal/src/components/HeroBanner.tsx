import React from 'react';
import { A, Div, H1, P, Span } from './basic';
import { resolveSlotImage } from './imageSlots';

export interface HeroBannerProps {
    eyebrow?: string;
    headline?: string;
    sub?: string;
    primaryCtaLabel?: string;
    primaryCtaHref?: string;
    secondaryCtaLabel?: string;
    secondaryCtaHref?: string;
    className?: string;
    /** Slot id of the visual tile image. */
    mediaSlot?: string;
    /** When true, render a soft ivory border/veil around the visual tile. */
    veil?: boolean;
    /** Visual variant — 'full' (default) bleeds the section edges, 'contained' adds side gutter. */
    bleed?: 'full' | 'contained';
}

export function HeroBanner({
    eyebrow,
    headline,
    sub,
    primaryCtaLabel,
    primaryCtaHref,
    secondaryCtaLabel,
    secondaryCtaHref,
    className,
    mediaSlot = 'hero-mood-1',
    veil = true,
    bleed = 'full',
}: HeroBannerProps): React.ReactElement {
    const mediaSrc = resolveSlotImage(mediaSlot);
    return (
        <Div
            className={className}
            style={{
                position: 'relative',
                backgroundColor: 'var(--scm-bg-primary, #FAF8F3)',
                borderRadius: bleed === 'contained' ? 'var(--scm-radius, 8px)' : 0,
                overflow: 'hidden',
            }}
            data-testid="hero-banner"
        >
            <Div
                style={{
                    maxWidth: 'var(--scm-max-width, 1200px)',
                    marginInline: 'auto',
                    paddingInline: 'var(--scm-gutter, 1rem)',
                    paddingBlock: 'clamp(3rem, 7vw, 6rem)',
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 1fr)',
                    alignItems: 'center',
                    gap: 'var(--scm-spacing-xl, 2.5rem)',
                }}
                className="scm-hero-grid"
            >
                <Div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--scm-spacing-md, 1rem)',
                        order: 1,
                    }}
                >
                    {eyebrow ? (
                        <Span
                            style={{
                                fontFamily: 'var(--scm-font-body, system-ui)',
                                fontSize: '0.75rem',
                                color: 'var(--scm-wood-dark, #A8916F)',
                                letterSpacing: '0.14em',
                                textTransform: 'uppercase',
                                fontWeight: 600,
                            }}
                        >
                            {eyebrow}
                        </Span>
                    ) : null}
                    {headline ? (
                        <H1
                            style={{
                                fontFamily: 'var(--scm-font-display, system-ui)',
                                fontSize: 'var(--scm-hero-heading-size, clamp(2rem, 5.6vw, 3.5rem))',
                                fontWeight: 600,
                                lineHeight: 1.1,
                                letterSpacing: '-0.015em',
                                color: 'var(--scm-text-primary, #26221E)',
                                margin: 0,
                                maxWidth: '18ch',
                            }}
                        >
                            {headline}
                        </H1>
                    ) : null}
                    <span
                        aria-hidden
                        style={{
                            display: 'block',
                            width: '48px',
                            height: '1px',
                            backgroundColor: 'var(--scm-wood, #C9B08D)',
                        }}
                    />
                    {sub ? (
                        <P
                            style={{
                                fontFamily: 'var(--scm-font-body, system-ui)',
                                fontSize: '0.9375rem',
                                lineHeight: 1.75,
                                color: 'var(--scm-text-body, #4A4643)',
                                margin: 0,
                                maxWidth: '44ch',
                            }}
                        >
                            {sub}
                        </P>
                    ) : null}
                    {(primaryCtaLabel && primaryCtaHref) || (secondaryCtaLabel && secondaryCtaHref) ? (
                        <Div
                            style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 'var(--scm-spacing-sm, 0.75rem)',
                                marginTop: 'var(--scm-spacing-md, 1rem)',
                            }}
                        >
                            {primaryCtaLabel && primaryCtaHref ? (
                                <A
                                    href={primaryCtaHref}
                                    data-scm-interactive
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        minHeight: 'var(--scm-touch-min, 44px)',
                                        padding: '0 var(--scm-spacing-lg, 1.5rem)',
                                        borderRadius: 'var(--scm-radius, 8px)',
                                        backgroundColor: 'var(--scm-charcoal, #26221E)',
                                        color: 'var(--scm-text-inverse, #FAF8F3)',
                                        textDecoration: 'none',
                                        fontFamily: 'var(--scm-font-body, system-ui)',
                                        fontSize: '0.9375rem',
                                        fontWeight: 600,
                                        letterSpacing: '0.02em',
                                    }}
                                >
                                    {primaryCtaLabel}
                                </A>
                            ) : null}
                            {secondaryCtaLabel && secondaryCtaHref ? (
                                <A
                                    href={secondaryCtaHref}
                                    data-scm-interactive
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        minHeight: 'var(--scm-touch-min, 44px)',
                                        padding: '0 var(--scm-spacing-lg, 1.5rem)',
                                        borderRadius: 'var(--scm-radius, 8px)',
                                        backgroundColor: 'transparent',
                                        color: 'var(--scm-text-primary, #26221E)',
                                        border: '1px solid var(--scm-charcoal, #26221E)',
                                        textDecoration: 'none',
                                        fontFamily: 'var(--scm-font-body, system-ui)',
                                        fontSize: '0.9375rem',
                                        fontWeight: 600,
                                        letterSpacing: '0.02em',
                                    }}
                                >
                                    {secondaryCtaLabel}
                                </A>
                            ) : null}
                        </Div>
                    ) : null}
                </Div>
                <Div
                    style={{
                        order: 2,
                        position: 'relative',
                        width: '100%',
                        aspectRatio: '4 / 3',
                        backgroundColor: 'var(--scm-bg-secondary, #F4F0E6)',
                        borderRadius: 'var(--scm-radius, 8px)',
                        overflow: 'hidden',
                        border: veil ? '1px solid var(--scm-line, #E4DCCE)' : 'none',
                    }}
                    aria-hidden
                >
                    <img
                        src={mediaSrc}
                        alt=""
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                </Div>
            </Div>
        </Div>
    );
}

export default HeroBanner;
