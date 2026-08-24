import React from 'react';
import { A } from './basic';

export interface TextLinkProps {
    href: string;
    children?: React.ReactNode;
    className?: string;
    'data-testid'?: string;
}

export function TextLink({ href, children, className, 'data-testid': dataTestId }: TextLinkProps): React.ReactElement {
    return (
        <A
            href={href}
            className={className}
            data-testid={dataTestId}
            style={{
                color: 'var(--20ft-text-primary, #1A1A1A)',
                textDecoration: 'none',
                fontWeight: 500,
                transition: 'color 150ms ease',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--20ft-heritage-gold, #B69B5F)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--20ft-text-primary, #1A1A1A)';
            }}
        >
            {children}
        </A>
    );
}

export default TextLink;
