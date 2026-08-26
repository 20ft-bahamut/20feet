import React from 'react';
import { Img } from './basic';

// Official 20ft logo SVGs are bundled as raw strings so they render without
// relying on the runtime asset endpoint. This avoids G7's `dist/`-only static
// asset serving limit and guarantees the logo works immediately after
// template:install/template:activate.
const logoModules = import.meta.glob<string>(
    '../../assets/brand/20ft/logo/*.svg',
    { query: '?raw', import: 'default', eager: true }
);

function resolveSvg(name: string): string {
    const path = `../../assets/brand/20ft/logo/${name}.svg`;
    const svg = logoModules[path];
    if (typeof svg !== 'string') {
        throw new Error(`BrandLogo: missing SVG asset for ${name}`);
    }
    return svg;
}

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

// Surface-driven asset selection: dark surfaces need light logos, light surfaces need dark logos.
const LOGO_FILE_MAP: Record<LogoVariant, Record<LogoSurface, string>> = {
    full: { dark: 'full-white', light: 'full' },
    compact: { dark: 'compact-white', light: 'compact' },
    symbol: { dark: 'symbol-white', light: 'symbol' },
    badge: { dark: 'badge-dark', light: 'badge-light' },
};

function svgToDataUri(svg: string): string {
    const cleaned = svg
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    return `data:image/svg+xml,${encodeURIComponent(cleaned)}`;
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
    const name = LOGO_FILE_MAP[variant][surface];
    const svg = resolveSvg(name);
    const src = svgToDataUri(svg);

    const logoStyle: React.CSSProperties = {
        display: 'block',
        height: height ?? (variant === 'badge' ? '3rem' : '1.5rem'),
        width: 'auto',
        maxWidth: '100%',
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
