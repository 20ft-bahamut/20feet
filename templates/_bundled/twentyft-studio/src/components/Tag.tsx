import React from 'react';
import { Span } from './basic';

export interface TagProps {
    label: string;
    className?: string;
}

export function Tag({ label, className }: TagProps): React.ReactElement {
    return (
        <Span
            className={className}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0.25rem 0.625rem',
                borderRadius: '9999px',
                border: '1px solid var(--20ft-border, rgba(16, 42, 76, 0.12))',
                backgroundColor: 'var(--20ft-paper-white, #FAF8F3)',
                color: 'var(--20ft-text-muted, #5A5A5A)',
                fontFamily: 'var(--20ft-font-body, sans-serif)',
                fontSize: '0.75rem',
                fontWeight: 500,
            }}
            data-testid="tag"
        >
            {label}
        </Span>
    );
}

export default Tag;
