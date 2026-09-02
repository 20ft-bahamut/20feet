import React from 'react';
import { A, Div, H1, H2, Img, P, Span } from './basic';
import { resolveSlotImage } from './imageSlots';
import { brandAssets, brandLogoInk, demoAssets } from './demoAssets';

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
    /** Render the small Still Form emblem stamp under the copy (default off). */
    stamp?: boolean;
    /** Heading tag. 'h2' (default) for in-page sections; 'h1' for a page hero (e.g. /shop/story). */
    headingAs?: 'h1' | 'h2';
    /** Stamp visual ink height in px (default 80). */
    stampHeight?: number;
}

/**
 * Still Form emblem stamp — clipped to the measured ink box so the
 * transparent canvas padding does not add offset, rendered quiet
 * (<= 0.6 opacity) as a brand signature at the end of the copy column.
 */
function BrandStamp({ height = 80 }: { height?: number }): React.ReactElement {
    const ink = brandLogoInk.emblem;
    const scale = (height / ink.h) * ink.canvas;
    return (
        <Span
            aria-hidden
            style={{
                position: 'relative',
                display: 'block',
                width: (ink.w / ink.canvas) * scale,
                height,
                marginTop: 'var(--scm-spacing-xs, 0.5rem)',
                overflow: 'hidden',
            }}
            data-scm-brand-stamp
        >
            <Img
                src={brandAssets.emblem}
                alt=""
                width={ink.canvas}
                height={ink.canvas}
                style={{
                    position: 'absolute',
                    left: -(ink.x / ink.canvas) * scale,
                    top: -(ink.y / ink.canvas) * scale,
                    width: scale,
                    height: scale,
                    display: 'block',
                    opacity: 0.55,
                }}
            />
        </Span>
    );
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
    stamp = false,
    stampHeight = 80,
    headingAs: HeadingAs = 'h2',
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
                {heading ? (() => {
                    const HeadingTag = HeadingAs === 'h1' ? H1 : H2;
                    return (
                    <HeadingTag
                        style={{
                            fontFamily: 'var(--scm-font-display, system-ui)',
                            fontSize: 'clamp(1.75rem, 3.6vw, 2.625rem)',
                            fontWeight: 600,
                            letterSpacing: '-0.018em',
                            lineHeight: 1.15,
                            color: 'var(--scm-text-primary, #26221E)',
                            margin: 0,
                            maxWidth: '20ch',
                            whiteSpace: 'pre-line',
                            wordBreak: 'keep-all',
                        }}
                    >
                        {heading}
                    </HeadingTag>
                    );
                })() : null}
                {body ? (
                    <P
                        style={{
                            fontFamily: 'var(--scm-font-body, system-ui)',
                            fontSize: '1rem',
                            color: 'var(--scm-text-body, #4A4643)',
                            lineHeight: 1.85,
                            margin: 0,
                            maxWidth: '36em',
                            whiteSpace: 'pre-line',
                            wordBreak: 'keep-all',
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
                {stamp ? (
                    <BrandStamp height={stampHeight} />
                ) : null}
            </Div>
        </Div>
    );
}

export default BrandStorySection;
