import React from 'react';
import { Span } from './basic';

export type BadgeTone = 'default' | 'discount' | 'soldout' | 'stopped' | 'new';

export interface BadgeProps {
    label: string;
    tone?: BadgeTone;
    className?: string;
}

function toneColor(tone: BadgeTone): { bg: string; fg: string; border: string } {
    switch (tone) {
        case 'discount':
            return {
                bg: 'var(--scm-charcoal, #26221E)',
                fg: 'var(--scm-text-inverse, #FAF8F3)',
                border: 'var(--scm-charcoal, #26221E)',
            };
        case 'soldout':
            return {
                bg: 'var(--scm-bg-secondary, #F4F0E6)',
                fg: 'var(--scm-text-muted, #8A837B)',
                border: 'var(--scm-line, #E4DCCE)',
            };
        case 'stopped':
            return {
                bg: 'var(--scm-bg-secondary, #F4F0E6)',
                fg: 'var(--scm-text-muted, #8A837B)',
                border: 'var(--scm-line, #E4DCCE)',
            };
        case 'new':
            return {
                bg: 'var(--scm-wood, #C9B08D)',
                fg: 'var(--scm-text-inverse, #FAF8F3)',
                border: 'var(--scm-wood, #C9B08D)',
            };
        case 'default':
        default:
            return {
                bg: 'transparent',
                fg: 'var(--scm-text-body, #4A4643)',
                border: 'var(--scm-line, #E4DCCE)',
            };
    }
}

export function Badge({ label, tone = 'default', className }: BadgeProps): React.ReactElement {
    const c = toneColor(tone);
    return (
        <Span
            className={className}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0.2rem 0.55rem',
                borderRadius: 'var(--scm-radius-sm, 4px)',
                border: `1px solid ${c.border}`,
                backgroundColor: c.bg,
                color: c.fg,
                fontFamily: 'var(--scm-font-body, system-ui)',
                fontSize: '0.75rem',
                fontWeight: 600,
                lineHeight: 1.2,
                letterSpacing: '0.02em',
            }}
            data-testid="badge"
            data-tone={tone}
        >
            {label}
        </Span>
    );
}

export default Badge;
