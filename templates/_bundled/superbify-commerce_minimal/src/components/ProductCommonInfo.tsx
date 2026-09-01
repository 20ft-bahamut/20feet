import React from 'react';
import { Div, H2, H3, P, Section, Span } from './basic';

export interface ProductCommonInfoData {
    /** Localized common-info title. May be a string or a {ko, en} map. */
    name?: string | { ko?: string; en?: string } | null;
    /** Localized content body. Supports plain text with bullets. */
    content?: string | { ko?: string; en?: string } | null;
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

function pickLocalized(input: unknown): string {
    if (!input) return '';
    if (typeof input === 'string') return input;
    if (typeof input === 'object') {
        const obj = input as { ko?: string; en?: string };
        return obj.ko ?? obj.en ?? '';
    }
    return '';
}

function isEmptyString(s: unknown): boolean {
    return typeof s !== 'string' || s.trim().length === 0;
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
export function ProductCommonInfo({
    commonInfo,
    notice,
    eyebrow = '안내',
    commonInfoTitle = '공통 안내',
    noticeTitle = '상품 정보 제공 고시',
    ariaLabel = 'product common info and notice',
    className,
}: ProductCommonInfoProps): React.ReactElement | null {
    const commonTitle = pickLocalized(commonInfo?.name) || commonInfoTitle;
    const commonContent = pickLocalized(commonInfo?.content);
    const commonMode = commonInfo?.content_mode ?? 'text';
    const hasCommon = !isEmptyString(commonContent) || !isEmptyString(pickLocalized(commonInfo?.name));

    const noticeRows = Array.isArray(notice?.values)
        ? notice!.values!.filter((row) => row && !isEmptyString(row.label ?? '') && !isEmptyString(row.value ?? ''))
        : [];
    const noticeTemplateName = pickLocalized(notice?.template_name);
    const hasNotice = noticeRows.length > 0;

    if (!hasCommon && !hasNotice) {
        return null;
    }

    return (
        <Section
            aria-label={ariaLabel}
            className={className}
            data-testid="product-common-info-notice"
            style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, .35fr) minmax(0, 1fr)',
                gap: 'var(--scm-spacing-xl, 2.5rem)',
                paddingTop: 'var(--scm-spacing-lg, 1.5rem)',
                paddingBottom: 'var(--scm-section-py-sm, 2.5rem)',
                borderTop: '1px solid var(--scm-line, #E4DCCE)',
            }}
        >
            <Div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--scm-spacing-xs, 0.5rem)',
                }}
            >
                <Span
                    style={{
                        fontFamily: 'var(--scm-font-body, system-ui)',
                        fontSize: '0.75rem',
                        color: 'var(--scm-wood-dark, #A8916F)',
                        letterSpacing: '0.14em',
                        textTransform: 'uppercase',
                        fontWeight: 600,
                    }}
                >
                    {eyebrow}
                </Span>
                <H2
                    style={{
                        fontFamily: 'var(--scm-font-display, system-ui)',
                        fontSize: '1.25rem',
                        fontWeight: 600,
                        letterSpacing: '-0.005em',
                        color: 'var(--scm-text-primary, #26221E)',
                        margin: 0,
                    }}
                >
                    {hasNotice ? noticeTitle : commonInfoTitle}
                </H2>
            </Div>

            <Div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--scm-spacing-lg, 1.5rem)',
                    maxWidth: '65ch',
                }}
            >
                {hasCommon ? (
                    <Div data-testid="product-common-info" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <H3
                            style={{
                                fontFamily: 'var(--scm-font-body, system-ui)',
                                fontSize: '0.95rem',
                                fontWeight: 600,
                                color: 'var(--scm-text-primary, #26221E)',
                                margin: 0,
                            }}
                        >
                            {commonTitle}
                        </H3>
                        {commonMode === 'html' ? (
                            <Div
                                data-testid="product-common-info-content-html"
                                style={{
                                    fontFamily: 'var(--scm-font-body, system-ui)',
                                    fontSize: '0.875rem',
                                    lineHeight: 1.85,
                                    color: 'var(--scm-text-body, #4A4643)',
                                }}
                                dangerouslySetInnerHTML={{ __html: commonContent }}
                            />
                        ) : (
                            <P
                                data-testid="product-common-info-content-text"
                                style={{
                                    fontFamily: 'var(--scm-font-body, system-ui)',
                                    fontSize: '0.875rem',
                                    lineHeight: 1.85,
                                    color: 'var(--scm-text-body, #4A4643)',
                                    margin: 0,
                                    whiteSpace: 'pre-line',
                                }}
                            >
                                {commonContent}
                            </P>
                        )}
                    </Div>
                ) : null}

                {hasNotice ? (
                    <Div data-testid="product-notice-items" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {noticeTemplateName ? (
                            <Span
                                data-testid="product-notice-template-name"
                                style={{
                                    fontFamily: 'var(--scm-font-body, system-ui)',
                                    fontSize: '0.78rem',
                                    color: 'var(--scm-text-muted, #8A837B)',
                                    letterSpacing: '0.04em',
                                }}
                            >
                                {noticeTemplateName}
                            </Span>
                        ) : null}
                        <Div
                            role="table"
                            aria-label={noticeTitle}
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'minmax(0, 0.42fr) minmax(0, 1fr)',
                                borderTop: '1px solid var(--scm-line, #E4DCCE)',
                                borderLeft: '1px solid var(--scm-line, #E4DCCE)',
                                borderRight: '1px solid var(--scm-line, #E4DCCE)',
                                borderRadius: 'var(--scm-radius-sm, 4px)',
                                overflow: 'hidden',
                            }}
                        >
                            {noticeRows.map((row, idx) => (
                                <React.Fragment key={`notice-${idx}`}>
                                    <Span
                                        role="cell"
                                        style={{
                                            fontFamily: 'var(--scm-font-body, system-ui)',
                                            fontSize: '0.78rem',
                                            fontWeight: 500,
                                            color: 'var(--scm-text-body, #4A4643)',
                                            background: 'var(--scm-surface-2, #F4EFE6)',
                                            padding: '0.55rem 0.75rem',
                                            borderBottom: '1px solid var(--scm-line, #E4DCCE)',
                                        }}
                                    >
                                        {row.label}
                                    </Span>
                                    <Span
                                        role="cell"
                                        data-testid="product-notice-row-value"
                                        style={{
                                            fontFamily: 'var(--scm-font-body, system-ui)',
                                            fontSize: '0.78rem',
                                            color: 'var(--scm-text-body, #4A4643)',
                                            padding: '0.55rem 0.75rem',
                                            borderBottom: '1px solid var(--scm-line, #E4DCCE)',
                                            whiteSpace: 'pre-line',
                                        }}
                                    >
                                        {row.value}
                                    </Span>
                                </React.Fragment>
                            ))}
                        </Div>
                    </Div>
                ) : null}
            </Div>
        </Section>
    );
}

export default ProductCommonInfo;