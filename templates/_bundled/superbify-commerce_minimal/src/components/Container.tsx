import React from 'react';
import { Div } from './basic';
import type { EditorAttrs } from '../types/template';

export interface ContainerProps {
    id?: string;
    children?: React.ReactNode;
    className?: string;
    wide?: boolean;
    editorAttrs?: EditorAttrs;
}

export function Container({ id, children, className, wide = false, editorAttrs }: ContainerProps): React.ReactElement {
    return (
        <Div
            id={id}
            className={className}
            {...editorAttrs}
            style={{
                width: '100%',
                maxWidth: wide ? 'none' : 'var(--scm-max-width, 1200px)',
                marginInline: 'auto',
                paddingInline: 'var(--scm-gutter, 1rem)',
                boxSizing: 'border-box',
            }}
            data-testid="container"
        >
            {children}
        </Div>
    );
}

export default Container;
