import React from 'react';
import { A, Div, H1, P, Span } from './basic';
import { resolveSlotImage } from './imageSlots';
import { demoAssets } from './demoAssets';

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
    /** Override the hero image directly with a bundled asset URL. */
    mediaSrc?: string;
    /** When true, render a soft ivory border/veil around the visual tile. */
    veil?: boolean;
    /** Visual variant — 'full' (default) bleeds the section edges, 'contained' adds side gutter. */
    bleed?: 'full' | 'contained';
    /**
     * Layout style.
     *  - 'split' (default): left type column + right 4:3 image tile
     *  - 'wide':   type left (~38%), image right (~62%) — confident desktop presence
     *  - 'stacked': full-width image on top, type below
     */
    layout?: 'split' | 'wide' | 'stacked';
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
    mediaSrc,
    veil = false,
    bleed = 'full',
    layout = 'wide',
}: HeroBannerProps): React.ReactElement {
    const src = mediaSrc ?? demoAssets.hero ?? resolveSlotImage(mediaSlot);
    const stacked = layout === 'stacked';

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
            data-layout={layout}
        >
            <Div
                style={{
                    maxWidth: 'var(--scm-max-width, 1200px)',
                    marginInline: 'auto',
                    paddingInline: 'var(--scm-gutter, 1rem)',
                    paddingBlock: stacked
                        ? 'clamp(2.5rem, 5vw, 4rem)'
                        : 'clamp(3rem, 7vw, 6rem)',
                    display: 'grid',
                    gridTemplateColumns: stacked ? 'minmax(0, 1fr)' : 'minmax(0, 1fr)',
                    alignItems: 'center',
                    gap: stacked ? 'var(--scm-spacing-lg, 1.5rem)' : 'var(--scm-spacing-xl, 2.5rem)',
                }}
                className={stacked ? '' : 'scm-hero-grid'}
            >
                {stacked ? (
                    <Div
                        aria-hidden
                        style={{
                            width: '100%',
                            aspectRatio: '21 / 9',
                            backgroundColor: 'var(--scm-bg-secondary, #F4F0E6)',
                            borderRadius: 'var(--scm-radius, 4px)',
                            overflow: 'hidden',
                            order: 1,
                        }}
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
                        order: 2,
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
                    {headline ? (
                        <H1
                            style={{
                                fontFamily: 'var(--scm-font-display, system-ui)',
                                fontSize: 'var(--scm-hero-heading-size, clamp(2rem, 5.6vw, 3.5rem))',
                                fontWeight: 600,
                                lineHeight: 1.08,
                                letterSpacing: '-0.02em',
                                color: 'var(--scm-text-primary, #26221E)',
                                margin: 0,
                                maxWidth: '16ch',
                                whiteSpace: 'pre-line',
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
                                        borderRadius: 'var(--scm-radius, 4px)',
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
                                        borderRadius: 'var(--scm-radius, 4px)',
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
                {!stacked ? (
                    <Div
                        data-testid="hero-image-tile"
                        style={{
                            order: 3,
                            position: 'relative',
                            width: '100%',
                            aspectRatio: layout === 'wide' ? '5 / 4' : '4 / 3',
                            backgroundColor: 'var(--scm-bg-secondary, #F4F0E6)',
                            borderRadius: 'var(--scm-radius, 4px)',
                            overflow: 'hidden',
                            border: veil ? '1px solid var(--scm-line, #E4DCCE)' : 'none',
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
            </Div>
        </Div>
    );
}

export default HeroBanner;
