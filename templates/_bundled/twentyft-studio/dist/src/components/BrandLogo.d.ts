import { default as React } from 'react';
export type LogoVariant = 'full' | 'compact' | 'symbol' | 'badge';
export type LogoSurface = 'dark' | 'light';
export interface BrandLogoProps {
    variant?: LogoVariant;
    /** The surface the logo sits on. `dark` selects a light/white logo for dark backgrounds; `light` selects a dark logo for light backgrounds. */
    surface?: LogoSurface;
    alt?: string;
    height?: React.CSSProperties['height'];
    className?: string;
    style?: React.CSSProperties;
    'data-testid'?: string;
}
export declare function BrandLogo({ variant, surface, alt, height, className, style, 'data-testid': dataTestId, }: BrandLogoProps): React.ReactElement;
export default BrandLogo;
