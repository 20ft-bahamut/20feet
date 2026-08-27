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
    /** Slot id of the background image; falls back to a neutral CSS block. */
    mediaSlot?: string;
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
}: HeroBannerProps): React.ReactElement {
    const mediaSrc = resolveSlotImage(mediaSlot);
    return (
        <Div
            className={className}
            style={{
                position: 'relative',
                display: 'grid',
                gridTemplateColumns: '1fr',
                alignItems: 'center',
                gap: 'var(--scm-spacing-lg, 1.5rem)',
                paddingBlock: 'var(--scm-hero-py, 3.5rem)',
                paddingInline: 0,
                backgroundColor: 'var(--scm-bg-secondary, #F4F0E6)',
                borderRadius: 'var(--scm-radius, 8px)',
                overflow: 'hidden',
            }}
            data-testid="hero-banner"
        >
            <Div
                aria-hidden
                style={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 0,
                }}
            >
                <img
                    src={mediaSrc}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
            </Div>
            <Div
                style={{
                    position: 'relative',
                    zIndex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--scm-spacing-sm, 0.75rem)',
                    paddingInline: 'var(--scm-gutter, 1rem)',
                    maxWidth: '46ch',
                }}
            >
                {eyebrow ? (
                    <Span
                        style={{
                            fontFamily: 'var(--scm-font-body, system-ui)',
                            fontSize: '0.75rem',
                            color: 'var(--scm-text-muted, #8A837B)',
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                        }}
                    >
                        {eyebrow}
                    </Span>
                ) : null}
                {headline ? (
                    <H1
                        style={{
                            fontFamily: 'var(--scm-font-display, system-ui)',
                            fontSize: 'var(--scm-hero-heading-size, clamp(1.875rem, 6vw, 3rem))',
                            fontWeight: 700,
                            lineHeight: 1.15,
                            color: 'var(--scm-text-primary, #26221E)',
                            margin: 0,
                        }}
                    >
                        {headline}
                    </H1>
                ) : null}
                {sub ? (
                    <P
                        style={{
                            fontFamily: 'var(--scm-font-body, system-ui)',
                            fontSize: '0.9375rem',
                            lineHeight: 1.7,
                            color: 'var(--scm-text-body, #4A4643)',
                            margin: 0,
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
                            marginTop: 'var(--scm-spacing-xs, 0.5rem)',
                        }}
                    >
                        {primaryCtaLabel && primaryCtaHref ? (
                            <A
                                href={primaryCtaHref}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    minHeight: 'var(--scm-touch-min, 44px)',
                                    padding: '0 var(--scm-spacing-md, 1rem)',
                                    borderRadius: 'var(--scm-radius, 8px)',
                                    backgroundColor: 'var(--scm-charcoal, #26221E)',
                                    color: 'var(--scm-text-inverse, #FAF8F3)',
                                    textDecoration: 'none',
                                    fontFamily: 'var(--scm-font-body, system-ui)',
                                    fontSize: '0.9375rem',
                                    fontWeight: 600,
                                }}
                            >
                                {primaryCtaLabel}
                            </A>
                        ) : null}
                        {secondaryCtaLabel && secondaryCtaHref ? (
                            <A
                                href={secondaryCtaHref}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    minHeight: 'var(--scm-touch-min, 44px)',
                                    padding: '0 var(--scm-spacing-md, 1rem)',
                                    borderRadius: 'var(--scm-radius, 8px)',
                                    backgroundColor: 'transparent',
                                    color: 'var(--scm-text-primary, #26221E)',
                                    border: '1px solid var(--scm-charcoal, #26221E)',
                                    textDecoration: 'none',
                                    fontFamily: 'var(--scm-font-body, system-ui)',
                                    fontSize: '0.9375rem',
                                    fontWeight: 600,
                                }}
                            >
                                {secondaryCtaLabel}
                            </A>
                        ) : null}
                    </Div>
                ) : null}
            </Div>
        </Div>
    );
}

export default HeroBanner;
