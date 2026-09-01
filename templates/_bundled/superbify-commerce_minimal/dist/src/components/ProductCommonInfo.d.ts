import { default as React } from 'react';
export interface ProductCommonInfoData {
    /** Localized common-info title. May be a string or a {ko, en} map. */
    name?: string | {
        ko?: string;
        en?: string;
    } | null;
    /** Localized content body. Supports plain text with bullets. */
    content?: string | {
        ko?: string;
        en?: string;
    } | null;
    /** 'html' to render content via dangerouslySetInnerHTML, otherwise text. */
    content_mode?: 'text' | 'html' | string | null;
}
export interface ProductNoticeItem {
    label?: string | null;
    value?: string | null;
}
export interface ProductNoticeData {
    template_name?: string | null;
    values?: ProductNoticeItem[] | null;
}
export interface ProductCommonInfoProps {
    /** Common info payload from public product detail API. */
    commonInfo?: ProductCommonInfoData | null;
    /** Notice items (상품정보제공고시) payload. */
    notice?: ProductNoticeData | null;
    /** Section eyebrow text. Defaults to '안내'. */
    eyebrow?: string;
    /** Title for the common-info subsection. Defaults to '공통 안내'. */
    commonInfoTitle?: string;
    /** Title for the notice subsection. Defaults to '상품 정보 제공 고시'. */
    noticeTitle?: string;
    /** Aria label for the wrapper section. */
    ariaLabel?: string;
    className?: string;
}
/**
 * Common info + product notice (상품정보제공고시) section for product detail.
 *
 * Two stacked subsections:
 *  - 공통 안내: title + rich-text content (html) or pre-line text (text)
 *  - 상품정보제공고시: definition-list of label → value rows
 *
 * Each subsection is independently hidden when its data is absent or empty
 * (no placeholder text). The wrapper section is hidden when both are empty.
 *
 * Styles follow Still Form design tokens (--scm-*).
 */
export declare function ProductCommonInfo({ commonInfo, notice, eyebrow, commonInfoTitle, noticeTitle, ariaLabel, className, }: ProductCommonInfoProps): React.ReactElement | null;
export default ProductCommonInfo;
