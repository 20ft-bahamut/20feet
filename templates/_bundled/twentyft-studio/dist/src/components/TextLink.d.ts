import { default as React } from 'react';
export interface TextLinkProps {
    href: string;
    children?: React.ReactNode;
    className?: string;
    'data-testid'?: string;
}
export declare function TextLink({ href, children, className, 'data-testid': dataTestId }: TextLinkProps): React.ReactElement;
export default TextLink;
