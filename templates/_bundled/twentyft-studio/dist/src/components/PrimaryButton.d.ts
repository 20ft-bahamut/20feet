import { default as React } from 'react';
import { EditorAttrs } from '../types/template';
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
export declare function PrimaryButton({ children, disabled, href, onClick, type, className, variant, size, 'data-testid': dataTestId, editorAttrs, }: PrimaryButtonProps): React.ReactElement;
export default PrimaryButton;
