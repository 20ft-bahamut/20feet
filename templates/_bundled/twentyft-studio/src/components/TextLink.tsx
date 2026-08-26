import React from 'react';
import { A, Span } from './basic';
import { useReducedMotion } from '../hooks/useReducedMotion';

export interface TextLinkProps {
    href: string;
    children?: React.ReactNode;
    className?: string;
    'data-testid'?: string;
}

export function TextLink({ href, children, className, 'data-testid': dataTestId }: TextLinkProps): React.ReactElement {
    const prefersReducedMotion = useReducedMotion();
    const [isHovered, setIsHovered] = React.useState(false);
    const [isFocused, setIsFocused] = React.useState(false);
    const active = isHovered || isFocused;

    return (
        <A
            href={href}
            className={className}
            data-testid={dataTestId}
            style={{
                position: 'relative',
                display: 'inline-flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                color: 'var(--20ft-text-primary, #1A1A1A)',
                textDecoration: 'none',
                fontWeight: 500,
                outline: 'none',
                maxWidth: '100%',
                minWidth: 0,
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
        >
            <Span
                style={{
                    color: active ? 'var(--20ft-heritage-gold, #B69B5F)' : 'inherit',
                    transition: `color var(--20ft-duration-base) var(--20ft-ease-out)`,
                }}
            >
                {children}
            </Span>

            <Span
                style={{
                    display: 'inline-block',
                    width: prefersReducedMotion ? '100%' : active ? '100%' : '0%',
                    height: '1px',
                    marginTop: '2px',
                    backgroundColor: 'var(--20ft-heritage-gold, #B69B5F)',
                    opacity: prefersReducedMotion ? (active ? 1 : 0.4) : 1,
                    transition: `width var(--20ft-duration-base) var(--20ft-ease-out), opacity var(--20ft-duration-base) var(--20ft-ease-out)`,
                    transformOrigin: 'left',
                }}
                aria-hidden="true"
            />

            {isFocused && (
                <Span
                    style={{
                        position: 'absolute',
                        inset: '-4px -6px',
                        border: '2px solid var(--20ft-heritage-gold, #B69B5F)',
                        borderRadius: 'var(--20ft-radius-sm, 2px)',
                        pointerEvents: 'none',
                    }}
                    aria-hidden="true"
                />
            )}
        </A>
    );
}

export default TextLink;
