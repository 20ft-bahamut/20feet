import React from 'react';
import { A, Div, Span } from './basic';
import { resolveSlotImage } from './imageSlots';

export interface PromoBannerProps {
    eyebrow?: string;
    title?: string;
    description?: string;
    ctaLabel?: string;
    ctaHref?: string;
    className?: string;
    mediaSlot?: string;
}

export function PromoBanner({
    eyebrow,
    title,
    description,
    ctaLabel,
    ctaHref,
    className,
    mediaSlot = 'promo-fallback',
}: PromoBannerProps): React.ReactElement {
    const mediaSrc = resolveSlotImage(mediaSlot);
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
        >
            <Div
                aria-hidden
                style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0.18,
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
                <Div style={{ position: 'relative', zIndex: 1 }}>
                    <A
                        href={ctaHref}
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

export default PromoBanner;
