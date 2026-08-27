import React from 'react';
import { A, Div, H2, P, Span } from './basic';
import { resolveSlotImage } from './imageSlots';

export interface BrandStorySectionProps {
    eyebrow?: string;
    heading?: string;
    body?: string;
    ctaLabel?: string;
    ctaHref?: string;
    className?: string;
    /** Slot id of a side image. */
    mediaSlot?: string;
}

export function BrandStorySection({
    eyebrow,
    heading,
    body,
    ctaLabel,
    ctaHref,
    className,
    mediaSlot = 'hero-mood-1',
}: BrandStorySectionProps): React.ReactElement {
    const mediaSrc = resolveSlotImage(mediaSlot);
    return (
        <Div
            className={className}
            style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: 'var(--scm-spacing-lg, 1.5rem)',
                alignItems: 'center',
                paddingBlock: 'var(--scm-section-py-md, 3rem)',
            }}
            data-testid="brand-story-section"
        >
            <Div
                style={{
                    aspectRatio: '4 / 3',
                    backgroundColor: 'var(--scm-ivory, #F4F0E6)',
                    borderRadius: 'var(--scm-radius, 8px)',
                    overflow: 'hidden',
                }}
                aria-hidden
            >
                <img
                    src={mediaSrc}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
            </Div>
            <Div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--scm-spacing-sm, 0.75rem)',
                }}
            >
                {eyebrow ? (
                    <Span
                        style={{
                            fontFamily: 'var(--scm-font-body, system-ui)',
                            fontSize: '0.75rem',
                            color: 'var(--scm-text-muted, #8A837B)',
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                        }}
                    >
                        {eyebrow}
                    </Span>
                ) : null}
                {heading ? (
                    <H2
                        style={{
                            fontFamily: 'var(--scm-font-display, system-ui)',
                            fontSize: '1.5rem',
                            fontWeight: 600,
                            color: 'var(--scm-text-primary, #26221E)',
                            margin: 0,
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
                            lineHeight: 1.7,
                            margin: 0,
                        }}
                    >
                        {body}
                    </P>
                ) : null}
                {ctaLabel && ctaHref ? (
                    <A
                        href={ctaHref}
                        style={{
                            alignSelf: 'flex-start',
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
                        {ctaLabel}
                    </A>
                ) : null}
            </Div>
        </Div>
    );
}

export default BrandStorySection;
