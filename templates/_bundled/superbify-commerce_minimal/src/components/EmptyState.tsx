import React from 'react';
import { Div, H3, P } from './basic';

export interface EmptyStateProps {
    title?: string;
    message?: string;
    ctaLabel?: string;
    ctaHref?: string;
    className?: string;
}

export function EmptyState({
    title = 'Nothing here yet',
    message,
    ctaLabel,
    ctaHref,
    className,
}: EmptyStateProps): React.ReactElement {
    return (
        <Div
            className={className}
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: 'var(--scm-spacing-2xl, 4rem) var(--scm-spacing-md, 1rem)',
                border: '1px dashed var(--scm-line, #E4DCCE)',
                borderRadius: 'var(--scm-radius, 8px)',
                backgroundColor: 'var(--scm-bg-secondary, #F4F0E6)',
                color: 'var(--scm-text-body, #4A4643)',
            }}
            data-testid="empty-state"
            role="status"
        >
            <Div
                aria-hidden
                style={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    backgroundColor: 'var(--scm-paper, #FAF8F3)',
                    border: '1px solid var(--scm-line, #E4DCCE)',
                    marginBottom: 'var(--scm-spacing-md, 1rem)',
                }}
            />
            <H3
                style={{
                    fontFamily: 'var(--scm-font-display, system-ui)',
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    color: 'var(--scm-text-primary, #26221E)',
                    margin: 0,
                    marginBottom: message ? 'var(--scm-spacing-2xs, 0.25rem)' : 0,
                }}
            >
                {title}
            </H3>
            {message ? (
                <P
                    style={{
                        fontFamily: 'var(--scm-font-body, system-ui)',
                        fontSize: '0.9375rem',
                        color: 'var(--scm-text-muted, #8A837B)',
                        margin: 0,
                        maxWidth: '40ch',
                    }}
                >
                    {message}
                </P>
            ) : null}
            {ctaLabel && ctaHref ? (
                <a
                    href={ctaHref}
                    style={{
                        marginTop: 'var(--scm-spacing-md, 1rem)',
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
                </a>
            ) : null}
        </Div>
    );
}

export default EmptyState;
