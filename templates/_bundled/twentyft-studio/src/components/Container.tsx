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
                maxWidth: wide ? 'none' : 'var(--20ft-max-width, 1360px)',
                marginInline: 'auto',
                paddingInline: 'var(--20ft-gutter, 1rem)',
                boxSizing: 'border-box',
            }}
            data-testid="container"
        >
            {children}
        </Div>
    );
}

export default Container;
