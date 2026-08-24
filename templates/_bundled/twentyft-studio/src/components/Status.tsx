import React from 'react';
import { Div, H3, P } from './basic';
import type { EditorAttrs } from '../types/template';

export interface StatusProps {
    title: string;
    message: string;
    className?: string;
    editorAttrs?: EditorAttrs;
}

export function Status({ title, message, className, editorAttrs }: StatusProps): React.ReactElement {
    return (
        <Div
            className={className}
            {...editorAttrs}
            style={{
                padding: 'var(--20ft-spacing-xl, 2.5rem)',
                borderRadius: 'var(--20ft-radius, 0.5rem)',
                border: '1px dashed var(--20ft-border-strong, #183B6B)',
                backgroundColor: 'var(--20ft-bg-secondary, #F4F0E6)',
                textAlign: 'center',
            }}
            data-testid="status"
        >
            <H3
                style={{
                    margin: 0,
                    marginBottom: 'var(--20ft-spacing-sm, 0.5rem)',
                    fontFamily: 'var(--20ft-font-display, Georgia, serif)',
                    fontSize: '1.125rem',
                    color: 'var(--20ft-indigo, #183B6B)',
                }}
            >
                {title}
            </H3>
            <P
                style={{
                    margin: 0,
                    fontFamily: 'var(--20ft-font-body, sans-serif)',
                    fontSize: '0.875rem',
                    color: 'var(--20ft-text-muted, #5A5A5A)',
                }}
            >
                {message}
            </P>
        </Div>
    );
}

export default Status;
