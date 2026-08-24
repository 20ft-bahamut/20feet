import React from 'react';
import { Span } from './basic';

export interface SectionEyebrowProps {
    text: string;
    className?: string;
}

export function SectionEyebrow({ text, className }: SectionEyebrowProps): React.ReactElement {
    return (
        <Span
            className={className}
            style={{
                display: 'block',
                fontFamily: 'var(--20ft-font-body, sans-serif)',
                fontSize: '0.75rem',
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--20ft-heritage-gold, #B69B5F)',
                marginBottom: 'var(--20ft-spacing-md, 1rem)',
            }}
            data-testid="section-eyebrow"
        >
            {text}
        </Span>
    );
}

export default SectionEyebrow;
