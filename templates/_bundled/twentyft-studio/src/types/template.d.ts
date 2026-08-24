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

export interface PortfolioItem {
    id: string;
    slug: string;
    title: string;
    summary?: string;
    description?: string;
    services?: string[];
    screenshotUrl?: string;
    externalUrl?: string;
}

export interface SuperBifyItem {
    id: string;
    slug: string;
    title: string;
    type: SuperBifyType;
    summary?: string;
    description?: string;
    compatibility?: string;
    installation?: string;
    usage?: string;
    changelog?: string;
    links?: {
        download?: string;
        github?: string;
        sir?: string;
        docs?: string;
        release?: string;
        purchase?: string;
    };
}

export interface RouteContext {
    slug?: string;
}

export interface DataSourceResponse<T> {
    data?: T;
    loading?: boolean;
    error?: Error | null;
}
