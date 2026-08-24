import React from 'react';
import { A, Button } from './basic';
import type { EditorAttrs } from '../types/template';

export interface PrimaryButtonProps {
    children?: React.ReactNode;
    disabled?: boolean;
    href?: string;
    onClick?: React.MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
    type?: 'button' | 'submit' | 'reset';
    className?: string;
    variant?: 'primary' | 'secondary';
    size?: 'default' | 'small';
    'data-testid'?: string;
    editorAttrs?: EditorAttrs;
}

export function PrimaryButton({
    children,
    disabled = false,
    href,
    onClick,
    type = 'button',
    className,
    variant = 'primary',
    size = 'default',
    'data-testid': dataTestId,
    editorAttrs,
}: PrimaryButtonProps): React.ReactElement {
    const isPrimary = variant === 'primary';
    const isSmall = size === 'small';

    const style: React.CSSProperties = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        padding: isSmall ? '0.625rem 1.25rem' : '0.875rem 1.5rem',
        borderRadius: 'var(--20ft-radius, 6px)',
        border: `1px solid ${isPrimary ? 'var(--20ft-signal-red, #E7482D)' : 'var(--20ft-indigo, #183B6B)'}`,
        backgroundColor: isPrimary ? 'var(--20ft-signal-red, #E7482D)' : 'transparent',
        color: isPrimary ? 'var(--20ft-paper-white, #FAF8F3)' : 'var(--20ft-indigo, #183B6B)',
        fontFamily: 'var(--20ft-font-body, sans-serif)',
        fontWeight: 600,
        fontSize: '0.875rem',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: 'opacity 150ms ease',
        textDecoration: 'none',
    };

    if (href) {
        return (
            <A
                href={href}
                className={className}
                {...editorAttrs}
                data-testid={dataTestId}
                style={style}
                aria-disabled={disabled || undefined}
                onClick={disabled ? (e) => e.preventDefault() : onClick}
            >
                {children}
            </A>
        );
    }

    return (
        <Button
            type={type}
            disabled={disabled}
            onClick={onClick}
            className={className}
            {...editorAttrs}
            data-testid={dataTestId}
            style={style}
        >
            {children}
        </Button>
    );
}

export default PrimaryButton;
