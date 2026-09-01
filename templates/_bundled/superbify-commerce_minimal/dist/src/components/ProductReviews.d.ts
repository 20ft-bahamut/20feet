import { default as React } from 'react';
export interface ProductReviewOptionSnapshot {
    key?: string;
    value?: string;
}
export interface ProductReviewImage {
    id?: number | string;
    url?: string;
    thumbnail_url?: string;
}
export interface ProductReview {
    id?: number | string;
    user?: {
        name?: string;
    };
    author_name?: string;
    content?: string;
    rating?: number;
    option_snapshot?: ProductReviewOptionSnapshot[];
    images?: ProductReviewImage[];
    has_reply?: boolean;
    reply_content?: string;
    replied_at?: string;
    created_at?: string;
}
export interface ProductReviewsResponse {
    reviews?: {
        data?: ProductReview[];
        meta?: {
            current_page?: number;
            last_page?: number;
            per_page?: number;
            has_more_pages?: boolean;
        };
    };
    rating_stats?: {
        avg?: number;
        1?: {
            count?: number;
            percent?: number;
        };
        2?: {
            count?: number;
            percent?: number;
        };
        3?: {
            count?: number;
            percent?: number;
        };
        4?: {
            count?: number;
            percent?: number;
        };
        5?: {
            count?: number;
            percent?: number;
        };
    };
    option_filters?: Array<{
        key?: string;
        values?: Array<{
            value?: string;
            count?: number;
        }>;
    }>;
    total_count?: number;
}
export interface ProductReviewsProps {
    productCode: string;
    ratingSummaryTitle?: string;
    sortLabel?: string;
    ratingLabel?: string;
    photoOnlyLabel?: string;
    sortLatestLabel?: string;
    sortRatingHighLabel?: string;
    sortRatingLowLabel?: string;
    anyRatingLabel?: string;
    emptyLabel?: string;
    prevLabel?: string;
    nextLabel?: string;
    pageLabel?: string;
    reviewsLabel?: string;
    sellerReplyLabel?: string;
    className?: string;
}
export declare function ProductReviews(props: ProductReviewsProps): React.ReactElement;
export default ProductReviews;
