import { default as React } from 'react';
export interface ProductQnaItem {
    id?: number | string;
    title?: string;
    content?: string;
    category?: string;
    is_secret?: boolean;
    is_owner?: boolean;
    has_reply?: boolean;
    answered?: boolean;
    reply?: {
        content?: string;
    };
    author_name?: string;
    created_at?: string;
}
export interface ProductQnaBoardSettings {
    secret_mode?: 'disabled' | 'optional' | 'always';
    categories?: string[];
    min_title_length?: number;
    max_title_length?: number;
    min_content_length?: number;
    max_content_length?: number;
}
export interface ProductQnaMeta {
    inquiry_available?: boolean;
    board_settings?: ProductQnaBoardSettings;
    abilities?: {
        can_update?: boolean;
        can_reply?: boolean;
        can_delete?: boolean;
    };
    total?: number;
    current_page?: number;
    per_page?: number;
    last_page?: number;
}
export interface ProductQnaResponse {
    items?: ProductQnaItem[];
    meta?: ProductQnaMeta;
}
export interface ProductQnaProps {
    productCode: string;
    inquiryBoardSlug?: string | null;
    isLoggedIn?: boolean;
    title?: string;
    writeLabel?: string;
    emptyLabel?: string;
    secretContentLabel?: string;
    loginRequiredLabel?: string;
    titleLabel?: string;
    contentLabel?: string;
    categoryLabel?: string;
    secretLabel?: string;
    submitLabel?: string;
    cancelLabel?: string;
    deleteLabel?: string;
    deleteConfirmTitle?: string;
    deleteConfirmMessage?: string;
    answeredLabel?: string;
    pendingLabel?: string;
    sellerReplyLabel?: string;
    className?: string;
}
export declare function ProductQna(props: ProductQnaProps): React.ReactElement | null;
export default ProductQna;
