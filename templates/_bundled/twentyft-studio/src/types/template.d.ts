/**
 * 20ft Studio Template Type Declarations
 */

export interface EditorAttrs {
    id?: string;
    'data-testid'?: string;
    'data-block-id'?: string;
    'data-component'?: string;
    [key: `data-${string}`]: string | undefined;
}

export type SuperBifyType =
    | 'MODULE'
    | 'PLUGIN'
    | 'TEMPLATE'
    | 'INTEGRATION'
    | 'DEVELOPER_TOOL'
    | 'OPEN_SOURCE';

export type PortfolioStatus =
    | 'BUILDING'
    | 'OPERATING'
    | 'RELEASED'
    | 'RESEARCH'
    | 'ARCHIVED';

export type PortfolioType =
    | 'WEB'
    | 'COMMERCE'
    | 'SOFTWARE'
    | 'OPEN_SOURCE';

export type SuperBifyStatus =
    | 'IDEA'
    | 'RESEARCH'
    | 'BUILDING'
    | 'RELEASED'
    | 'MAINTENANCE'
    | 'ARCHIVED';

export interface PortfolioItem {
    id: string;
    slug: string;
    title: string;
    summary?: string;
    description?: string;
    types?: PortfolioType[];
    year?: string;
    status?: PortfolioStatus;
    featured?: boolean;
    clientName?: string;
    role?: string[];
    techStack?: string[];
    relatedUrl?: string;
    coverImageUrl?: string;
    galleryImageUrls?: string[];
    /** Development-only fixture marker. Must not be exposed as production data. */
    isFixture?: boolean;
}

export interface SuperBifyItem {
    id: string;
    slug: string;
    title: string;
    type: SuperBifyType;
    summary?: string;
    description?: string;
    status?: SuperBifyStatus;
    version?: string;
    compatibility?: string;
    license?: string;
    featured?: boolean;
    links?: {
        download?: string;
        github?: string;
        sir?: string;
        docs?: string;
        release?: string;
        purchase?: string;
        demo?: string;
    };
    coverImageUrl?: string;
    screenshotImageUrls?: string[];
    /** Development-only fixture marker. Must not be exposed as production data. */
    isFixture?: boolean;
}

export interface RouteContext {
    slug?: string;
}

export interface DataSourceResponse<T> {
    data?: T;
    loading?: boolean;
    error?: Error | null;
}

