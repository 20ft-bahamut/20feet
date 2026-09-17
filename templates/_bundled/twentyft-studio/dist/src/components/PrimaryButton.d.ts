import { default as React } from 'react';
import { EditorAttrs } from '../types/template';
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
export declare function PrimaryButton({ children, disabled, href, onClick, type, className, variant, size, 'data-testid': dataTestId, editorAttrs, }: PrimaryButtonProps): React.ReactElement;
export default PrimaryButton;
