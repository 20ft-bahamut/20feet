import React from 'react';
import { Img } from './basic';

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

const ASSET_BASE = 'assets/brand/20ft/logo';

// Surface-driven asset selection: dark surfaces need light logos, light surfaces need dark logos.
const LOGO_FILE_MAP: Record<LogoVariant, Record<LogoSurface, string>> = {
    full: { dark: 'full-white.svg', light: 'full.svg' },
    compact: { dark: 'compact-white.svg', light: 'compact.svg' },
    symbol: { dark: 'symbol-white.svg', light: 'symbol.svg' },
    badge: { dark: 'badge-dark.svg', light: 'badge-light.svg' },
};

function resolveAssetUrl(relativePath: string): string {
    const g7 = (window as any).G7Core;
    const resolved = g7?.templateEngine?.getAssetUrl?.(relativePath);
    if (typeof resolved === 'string' && resolved.length > 0) {
        return resolved;
    }
    return relativePath;
}

export function BrandLogo({
    variant = 'full',
    surface = 'light',
    alt = '20ft',
    height,
    className,
    style,
    'data-testid': dataTestId = 'brand-logo',
}: BrandLogoProps): React.ReactElement {
    const file = LOGO_FILE_MAP[variant][surface];
    const src = resolveAssetUrl(`${ASSET_BASE}/${file}`);

    const logoStyle: React.CSSProperties = {
        display: 'block',
        height: height ?? (variant === 'badge' ? '3rem' : '1.5rem'),
        width: 'auto',
        ...style,
    };

    return (
        <Img
            src={src}
            alt={alt}
            className={className}
            style={logoStyle}
            data-testid={dataTestId}
        />
    );
}

export default BrandLogo;
