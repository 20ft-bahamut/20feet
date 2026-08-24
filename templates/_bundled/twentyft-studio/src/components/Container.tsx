import React from 'react';
import { Div } from './basic';
import type { EditorAttrs } from '../types/template';

export interface ContainerProps {
    id?: string;
    children?: React.ReactNode;
    className?: string;
    editorAttrs?: EditorAttrs;
}

export function Container({ id, children, className, editorAttrs }: ContainerProps): React.ReactElement {
    return (
        <Div
            id={id}
            className={className}
            {...editorAttrs}
            style={{
                width: '100%',
                maxWidth: 'var(--20ft-max-width, 1280px)',
                marginInline: 'auto',
                paddingInline: 'var(--20ft-spacing-md, 1rem)',
            }}
            data-testid="container"
        >
            {children}
        </Div>
    );
}

export default Container;
