import React from 'react';
import { A, Div, P, Span } from './basic';

export interface EditorialBannerProps {
    eyebrow?: string;
    heading: string;
    body?: string;
    ctaLabel?: string;
    ctaHref?: string;
    className?: string;
    /** Toggle: render the body in inverted (charcoal background) style. Defaults to ivory. */
    inverted?: boolean;
}

/**
 * Full-width editorial band: large display heading + thin wood rule + CTA link.
 * Used on home to break product grids with type.
 */
export function EditorialBanner({
    eyebrow,
    heading,
    body,
    ctaLabel,
    ctaHref,
    className,
    inverted = false,
}: EditorialBannerProps): React.ReactElement {
    const dark = inverted;
    return (
        <Div
            className={className}
            data-testid="editorial-banner"
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--scm-spacing-md, 1rem)',
                paddingBlock: 'var(--scm-section-py-md, 4rem)',
                paddingInline: 'var(--scm-gutter, 1rem)',
                backgroundColor: dark ? 'var(--scm-bg-surface-dark, #26221E)' : 'var(--scm-bg-secondary, #F4F0E6)',
                color: dark ? 'var(--scm-text-inverse, #FAF8F3)' : 'var(--scm-text-primary, #26221E)',
                borderRadius: 'var(--scm-radius, 8px)',
            }}
        >
            <Div
                style={{
                    maxWidth: 'var(--scm-max-width, 1200px)',
                    marginInline: 'auto',
                    width: '100%',
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
                            color: dark ? 'var(--scm-wood, #C9B08D)' : 'var(--scm-wood-dark, #A8916F)',
                            letterSpacing: '0.14em',
                            textTransform: 'uppercase',
                            fontWeight: 600,
                        }}
                    >
                        {eyebrow}
                    </Span>
                ) : null}
                <Div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--scm-spacing-sm, 0.75rem)',
                        maxWidth: '32ch',
                    }}
                >
                    <span
                        style={{
                            display: 'block',
                            width: '48px',
                            height: '1px',
                            backgroundColor: dark ? 'var(--scm-wood, #C9B08D)' : 'var(--scm-wood, #C9B08D)',
                        }}
                        aria-hidden
                    />
                    <h2
                        style={{
                            fontFamily: 'var(--scm-font-display, system-ui)',
                            fontSize: 'clamp(1.875rem, 4.5vw, 2.75rem)',
                            fontWeight: 600,
                            lineHeight: 1.18,
                            letterSpacing: '-0.01em',
                            margin: 0,
                            color: 'inherit',
                        }}
                    >
                        {heading}
                    </h2>
                </Div>
                {body ? (
                    <P
                        style={{
                            fontFamily: 'var(--scm-font-body, system-ui)',
                            fontSize: '0.9375rem',
                            lineHeight: 1.7,
                            color: dark ? 'rgba(250, 248, 243, 0.78)' : 'var(--scm-text-body, #4A4643)',
                            margin: 0,
                            maxWidth: '56ch',
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
                            marginTop: 'var(--scm-spacing-2xs, 0.25rem)',
                            color: 'inherit',
                            textDecoration: 'none',
                            borderBottom: `1px solid ${dark ? 'var(--scm-wood, #C9B08D)' : 'var(--scm-charcoal, #26221E)'}`,
                            fontFamily: 'var(--scm-font-body, system-ui)',
                            fontSize: '0.9375rem',
                            fontWeight: 600,
                            letterSpacing: '0.02em',
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

export default EditorialBanner;
