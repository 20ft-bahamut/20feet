import React from 'react';
import { A, Div, P, Span } from './basic';
import { resolveSlotImage } from './imageSlots';
import { demoAssets } from './demoAssets';

export interface EditorialBannerProps {
    eyebrow?: string;
    heading: string;
    body?: string;
    ctaLabel?: string;
    ctaHref?: string;
    className?: string;
    /** Toggle: render the body in inverted (charcoal background) style. Defaults to ivory. */
    inverted?: boolean;
    /** Override the visual asset directly. */
    mediaSrc?: string;
    /** Render the visual: 'side' (image+type), 'full' (full-width image, overlay text), 'panel' (text panel left ~44%, image right ~56% flush). */
    variant?: 'side' | 'full' | 'panel';
}

/**
 * Full-width editorial band. Two variants:
 *   - 'side'  : image left + type right (default)
 *   - 'full'  : full-width image with overlay type (subtle dark veil)
 *
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
    mediaSrc,
    variant = 'full',
}: EditorialBannerProps): React.ReactElement {
    const src = mediaSrc ?? demoAssets.editorial ?? resolveSlotImage('hero-mood-3');
    const dark = inverted;

    if (variant === 'side') {
        return (
            <Div
                className={className}
                data-testid="editorial-banner"
                data-variant="side"
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 0.85fr)',
                    gap: 'var(--scm-spacing-xl, 2.5rem)',
                    alignItems: 'stretch',
                    backgroundColor: 'var(--scm-bg-secondary, #F4F0E6)',
                    borderRadius: 'var(--scm-radius, 4px)',
                    overflow: 'hidden',
                }}
            >
                <Div
                    aria-hidden
                    style={{
                        aspectRatio: '5 / 4',
                        minHeight: '300px',
                        backgroundColor: 'var(--scm-bg-secondary, #F4F0E6)',
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
                        aria-hidden
                        style={{ display: 'block', width: '48px', height: '1px', backgroundColor: 'var(--scm-wood, #C9B08D)' }}
                    />
                    <h2
                        style={{
                            fontFamily: 'var(--scm-font-display, system-ui)',
                            fontSize: 'clamp(1.625rem, 3vw, 2.25rem)',
                            fontWeight: 600,
                            lineHeight: 1.18,
                            letterSpacing: '-0.015em',
                            margin: 0,
                            color: 'var(--scm-text-primary, #26221E)',
                            maxWidth: '20ch',
                        }}
                    >
                        {heading}
                    </h2>
                    {body ? (
                        <P
                            style={{
                                fontFamily: 'var(--scm-font-body, system-ui)',
                                fontSize: '0.9375rem',
                                lineHeight: 1.75,
                                color: 'var(--scm-text-body, #4A4643)',
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
                                marginTop: 'var(--scm-spacing-2xs, 0.25rem)',
                                color: 'var(--scm-text-primary, #26221E)',
                                textDecoration: 'none',
                                borderBottom: '1px solid var(--scm-charcoal, #26221E)',
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

    // 'full' variant — full-width image, optional dark inverted style with text overlay
    if (variant === 'panel') {
        return (
            <Div
                className={className}
                data-testid="editorial-banner"
                data-variant="panel"
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 44fr) minmax(0, 56fr)',
                    alignItems: 'stretch',
                    backgroundColor: 'var(--scm-bg-secondary, #F4F0E6)',
                    borderRadius: 'var(--scm-radius, 4px)',
                    overflow: 'hidden',
                }}
            >
                <Div
                    data-scm-id="editorial-panel-text"
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        gap: 'var(--scm-spacing-md, 1rem)',
                        padding: 'clamp(1.75rem, 4vw, 4rem)',
                        order: 1,
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
                        aria-hidden
                        style={{ display: 'block', width: '48px', height: '1px', backgroundColor: 'var(--scm-wood, #C9B08D)' }}
                    />
                    <h2
                        style={{
                            fontFamily: 'var(--scm-font-display, system-ui)',
                            fontSize: 'clamp(1.625rem, 3vw, 2.25rem)',
                            fontWeight: 600,
                            lineHeight: 1.18,
                            letterSpacing: '-0.015em',
                            margin: 0,
                            color: 'var(--scm-text-primary, #26221E)',
                            maxWidth: '20ch',
                            whiteSpace: 'pre-line',
                        }}
                    >
                        {heading}
                    </h2>
                    {body ? (
                        <P
                            style={{
                                fontFamily: 'var(--scm-font-body, system-ui)',
                                fontSize: '0.9375rem',
                                lineHeight: 1.75,
                                color: 'var(--scm-text-body, #4A4643)',
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
                                marginTop: 'var(--scm-spacing-2xs, 0.25rem)',
                                color: 'var(--scm-text-primary, #26221E)',
                                textDecoration: 'none',
                                borderBottom: '1px solid var(--scm-charcoal, #26221E)',
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
                <Div
                    data-scm-id="editorial-panel-image"
                    aria-hidden
                    style={{
                        position: 'relative',
                        minHeight: '320px',
                        backgroundColor: 'var(--scm-bg-secondary, #F4F0E6)',
                        order: 2,
                    }}
                >
                    <img
                        src={src}
                        alt=""
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                </Div>
            </Div>
        );
    }

    // 'full' variant — full-width image, optional dark inverted style with text overlay
    return (
        <Div
            className={className}
            data-testid="editorial-banner"
            data-variant="full"
            style={{
                position: 'relative',
                borderRadius: 'var(--scm-radius, 4px)',
                overflow: 'hidden',
                backgroundColor: dark ? 'var(--scm-bg-surface-dark, #26221E)' : 'var(--scm-bg-secondary, #F4F0E6)',
                color: dark ? 'var(--scm-text-inverse, #FAF8F3)' : 'var(--scm-text-primary, #26221E)',
                aspectRatio: '21 / 9',
                minHeight: '320px',
            }}
        >
            <img
                src={src}
                alt=""
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
            <div
                aria-hidden
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: dark
                        ? 'linear-gradient(90deg, rgba(38,34,30,0.78) 0%, rgba(38,34,30,0.40) 55%, rgba(38,34,30,0.20) 100%)'
                        : 'linear-gradient(90deg, rgba(250,248,243,0.96) 0%, rgba(250,248,243,0.85) 35%, rgba(250,248,243,0.30) 65%, rgba(250,248,243,0.05) 100%)',
                }}
            />
            <Div
                style={{
                    position: 'relative',
                    maxWidth: 'var(--scm-max-width, 1200px)',
                    marginInline: 'auto',
                    width: '100%',
                    height: '100%',
                    paddingInline: 'clamp(1.5rem, 4vw, 3rem)',
                    paddingBlock: 'clamp(2rem, 4vw, 3.5rem)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    gap: 'var(--scm-spacing-md, 1rem)',
                }}
            >
                {eyebrow ? (
                    <Span
                        style={{
                            fontFamily: 'var(--scm-font-body, system-ui)',
                            fontSize: '0.75rem',
                            color: dark ? 'var(--scm-wood, #C9B08D)' : 'var(--scm-wood-dark, #A8916F)',
                            letterSpacing: '0.18em',
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
                            backgroundColor: 'var(--scm-wood, #C9B08D)',
                        }}
                        aria-hidden
                    />
                    <h2
                        style={{
                            fontFamily: 'var(--scm-font-display, system-ui)',
                            fontSize: 'clamp(1.75rem, 3.8vw, 2.75rem)',
                            fontWeight: 600,
                            lineHeight: 1.15,
                            letterSpacing: '-0.015em',
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
                            color: dark ? 'rgba(250, 248, 243, 0.82)' : 'var(--scm-text-body, #4A4643)',
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
