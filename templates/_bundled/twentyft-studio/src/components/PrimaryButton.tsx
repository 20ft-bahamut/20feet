import React from 'react';
import { A, Button } from './basic';
import { useReducedMotion } from '../hooks/useReducedMotion';
import type { EditorAttrs } from '../types/template';

export interface PrimaryButtonProps {
    children?: React.ReactNode;
    disabled?: boolean;
    href?: string;
    onClick?: React.MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
    type?: 'button' | 'submit' | 'reset';
    className?: string;
    /**
     * primary   — 주 행동 (signal red)
     * secondary — 보조 행동, 밝은 배경용 (indigo 외곽선)
     * inverse   — 보조 행동, 어두운 배경용 (paper white 외곽선)
     *
     * 어두운 섹션에서 secondary를 쓰면 남색 외곽선이 배경에 묻혀 보이지 않는다.
     */
    variant?: 'primary' | 'secondary' | 'inverse';
    size?: 'default' | 'medium' | 'small';
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
    const isInverse = variant === 'inverse';
    const isSmall = size === 'small';
    const isMedium = size === 'medium';
    const prefersReducedMotion = useReducedMotion();
    const [isHovered, setIsHovered] = React.useState(false);
    const [isFocused, setIsFocused] = React.useState(false);

    const baseColor = isPrimary
        ? 'var(--20ft-signal-red, #E7482D)'
        : isInverse
          ? 'var(--20ft-paper-white, #FAF8F3)'
          : 'var(--20ft-indigo, #183B6B)';
    const hoverColor = isPrimary
        ? '#c93e27'
        : isInverse
          ? 'var(--20ft-heritage-gold, #B69B5F)'
          : 'var(--20ft-deep-indigo, #102A4C)';

    const style: React.CSSProperties = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        maxWidth: '100%',
        padding: isSmall ? '0.625rem 1.25rem' : isMedium ? '0.75rem 1.75rem' : '0.875rem 1.5rem',
        fontSize: isMedium ? '1rem' : '0.875rem',
        borderRadius: 'var(--20ft-radius, 6px)',
        // border 단축 속성은 var()와 함께 쓰면 일부 파서에서 값이 갈라진다.
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: baseColor,
        backgroundColor: isPrimary ? baseColor : 'transparent',
        color: isPrimary ? 'var(--20ft-paper-white, #FAF8F3)' : baseColor,
        fontFamily: 'var(--20ft-font-body, sans-serif)',
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: `color var(--20ft-duration-base) var(--20ft-ease-out),
                     background-color var(--20ft-duration-base) var(--20ft-ease-out),
                     border-color var(--20ft-duration-base) var(--20ft-ease-out),
                     transform var(--20ft-duration-base) var(--20ft-ease-out),
                     box-shadow var(--20ft-duration-base) var(--20ft-ease-out)`,
        textDecoration: 'none',
        transform: isHovered && !prefersReducedMotion ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow:
            isHovered && !prefersReducedMotion
                ? '0 4px 12px rgba(16, 42, 76, 0.10)'
                : '0 0 0 rgba(16, 42, 76, 0)',
        outline: 'none',
    };

    if (isFocused) {
        style.outline = '2px solid var(--20ft-heritage-gold, #B69B5F)';
        style.outlineOffset = '2px';
    }

    if (isHovered && !disabled) {
        style.backgroundColor = isPrimary ? hoverColor : 'transparent';
        style.borderColor = hoverColor;
        style.color = isPrimary ? 'var(--20ft-paper-white, #FAF8F3)' : hoverColor;
    }

    const eventHandlers = {
        onMouseEnter: () => setIsHovered(true),
        onMouseLeave: () => setIsHovered(false),
        onFocus: () => setIsFocused(true),
        onBlur: () => setIsFocused(false),
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
                {...eventHandlers}
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
            {...eventHandlers}
        >
            {children}
        </Button>
    );
}

export default PrimaryButton;
