import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Div, H3, Input, Label, P, Select, Span } from './basic';

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
    user?: { name?: string };
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
        1?: { count?: number; percent?: number };
        2?: { count?: number; percent?: number };
        3?: { count?: number; percent?: number };
        4?: { count?: number; percent?: number };
        5?: { count?: number; percent?: number };
    };
    option_filters?: Array<{ key?: string; values?: Array<{ value?: string; count?: number }> }>;
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

const DEFAULT_PER_PAGE = 5;

interface G7CoreLike {
    api?: { getToken?: () => string | null };
    toast?: {
        success?: (msg: string) => void;
        error?: (msg: string) => void;
        info?: (msg: string) => void;
        show?: (msg: string, opts?: { type?: string }) => void;
    };
}

function getToken(): string | null {
    try {
        const g7 = (window as unknown as { G7Core?: G7CoreLike }).G7Core;
        const t = g7?.api?.getToken?.();
        return typeof t === 'string' && t.length > 0 ? t : null;
    } catch {
        return null;
    }
}

function resolveLabel(
    value: string | string[] | Record<string, string> | null | undefined,
    locale: string = 'ko'
): string {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (Array.isArray(value)) {
        for (const v of value) {
            const r = resolveLabel(v, locale);
            if (r) return r;
        }
        return '';
    }
    if (typeof value === 'object') {
        return (value as Record<string, string>)[locale] ?? Object.values(value)[0] ?? '';
    }
    return '';
}

function StarBar({ rating }: { rating: number }) {
    return (
        <span aria-label={`${rating}점`} style={{ color: 'var(--scm-wood, #C9B08D)', fontSize: '0.95rem' }}>
            {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} aria-hidden="true">{i < rating ? '★' : '☆'}</span>
            ))}
        </span>
    );
}

export function ProductReviews(props: ProductReviewsProps): React.ReactElement {
    const {
        productCode,
        ratingSummaryTitle = '이 상품 리뷰',
        sortLabel = '정렬',
        ratingLabel = '별점',
        photoOnlyLabel = '사진 리뷰만',
        sortLatestLabel = '최신순',
        sortRatingHighLabel = '평점 높은순',
        sortRatingLowLabel = '평점 낮은순',
        anyRatingLabel = '전체',
        emptyLabel = '등록된 리뷰가 없습니다.',
        prevLabel = '이전',
        nextLabel = '다음',
        pageLabel = '페이지',
        reviewsLabel = '리뷰',
        sellerReplyLabel = '판매자 답변',
        className,
    } = props;

    const [page, setPage] = useState(1);
    const [sort, setSort] = useState<'created_at_desc' | 'rating_desc' | 'rating_asc'>('created_at_desc');
    const [rating, setRating] = useState<number | ''>('');
    const [photoOnly, setPhotoOnly] = useState(false);
    const [data, setData] = useState<ProductReviewsResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const perPage = DEFAULT_PER_PAGE;

    const fetchReviews = useCallback(async () => {
        setLoading(true);
        setError(null);
        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('per_page', String(perPage));
        params.set('sort', sort);
        if (rating !== '') params.set('rating', String(rating));
        if (photoOnly) params.set('photo_only', '1');
        const url = `/api/modules/sirsoft-ecommerce/products/${encodeURIComponent(productCode)}/reviews?${params.toString()}`;
        const token = getToken();
        try {
            const res = await fetch(url, {
                method: 'GET',
                credentials: 'same-origin',
                headers: {
                    'Accept': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });
            if (res.status === 401) {
                // Guest — silent (empty state allowed)
                setData(null);
                return;
            }
            if (!res.ok) {
                let msg = `HTTP ${res.status}`;
                try {
                    const body = await res.json();
                    msg = body?.errors?.message ?? body?.message ?? msg;
                } catch { /* keep */ }
                setError(msg);
                setData(null);
                return;
            }
            const body = await res.json().catch(() => ({}));
            const payload = body?.data ?? body;
            setData(payload as ProductReviewsResponse);
        } catch (err) {
            setError((err as Error)?.message ?? 'Network error');
            setData(null);
        } finally {
            setLoading(false);
        }
    }, [productCode, page, perPage, sort, rating, photoOnly]);

    useEffect(() => {
        void fetchReviews();
    }, [fetchReviews]);

    const reviews = data?.reviews?.data ?? [];
    const meta = data?.reviews?.meta;
    const ratingStats = data?.rating_stats;
    const total = data?.total_count ?? reviews.length;
    const avg = typeof ratingStats?.avg === 'number' ? ratingStats.avg : 0;

    const lastPage = useMemo(() => {
        if (typeof meta?.last_page === 'number' && meta.last_page > 0) return meta.last_page;
        if (typeof meta?.has_more_pages === 'boolean') return meta.has_more_pages ? Math.max(page + 1, page) : page;
        return 1;
    }, [meta, page]);

    const optionFilters = data?.option_filters ?? [];

    return (
        <Div
            data-testid="product-reviews"
            className={className}
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--scm-spacing-md, 1rem)',
                padding: 'var(--scm-spacing-lg, 1.5rem) 0',
                borderTop: '1px solid var(--scm-line, #E4DCCE)',
            }}
        >
            <H3
                style={{
                    fontFamily: 'var(--scm-font-display, system-ui)',
                    fontSize: '1.2rem',
                    fontWeight: 600,
                    color: 'var(--scm-text-primary, #26221E)',
                    margin: 0,
                }}
            >
                {ratingSummaryTitle}{' '}
                <Span
                    style={{
                        color: 'var(--scm-text-muted, #8A837B)',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                    }}
                >
                    ({total.toLocaleString()})
                </Span>
            </H3>

            {/* Summary block */}
            <Div
                data-testid="reviews-summary"
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, auto) 1fr',
                    gap: 'var(--scm-spacing-lg, 1.5rem)',
                    padding: 'var(--scm-spacing-md, 1rem)',
                    border: '1px solid var(--scm-line, #E4DCCE)',
                    borderRadius: 'var(--scm-radius, 8px)',
                    background: 'var(--scm-surface, #FAF8F3)',
                }}
            >
                <Div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.25rem',
                    }}
                >
                    <Span
                        data-testid="reviews-summary-avg"
                        style={{
                            fontFamily: 'var(--scm-font-display, system-ui)',
                            fontSize: '2rem',
                            fontWeight: 700,
                            color: 'var(--scm-text-primary, #26221E)',
                            lineHeight: 1.1,
                        }}
                    >
                        {avg.toFixed(1)}
                    </Span>
                    <StarBar rating={Math.round(avg)} />
                    <Span
                        style={{
                            fontSize: '0.78rem',
                            color: 'var(--scm-text-muted, #8A837B)',
                        }}
                    >
                        {total.toLocaleString()} {reviewsLabel}
                    </Span>
                </Div>
                <Div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--scm-spacing-xs, 0.5rem)',
                    }}
                >
                    {[5, 4, 3, 2, 1].map((n) => {
                        const bucket = ratingStats?.[String(n) as '1' | '2' | '3' | '4' | '5'];
                        const count = typeof bucket?.count === 'number' ? bucket.count : 0;
                        const pct = typeof bucket?.percent === 'number' ? bucket.percent : 0;
                        return (
                            <Div
                                key={`bar-${n}`}
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '2rem 1fr 3rem',
                                    alignItems: 'center',
                                    gap: 'var(--scm-spacing-sm, 0.75rem)',
                                    fontSize: '0.78rem',
                                    color: 'var(--scm-text-muted, #8A837B)',
                                }}
                            >
                                <span>{n}점</span>
                                <span
                                    style={{
                                        display: 'block',
                                        background: 'var(--scm-line, #E4DCCE)',
                                        height: '6px',
                                        borderRadius: '999px',
                                        overflow: 'hidden',
                                    }}
                                >
                                    <span
                                        style={{
                                            display: 'block',
                                            background: 'var(--scm-wood, #C9B08D)',
                                            height: '100%',
                                            width: `${pct}%`,
                                        }}
                                    />
                                </span>
                                <span style={{ textAlign: 'right' }}>{count.toLocaleString()}</span>
                            </Div>
                        );
                    })}
                </Div>
            </Div>

            {/* Filter row */}
            <Div
                style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 'var(--scm-spacing-sm, 0.75rem)',
                    alignItems: 'center',
                }}
            >
                <Label
                    htmlFor="scm-reviews-sort"
                    style={{ fontSize: '0.78rem', color: 'var(--scm-text-muted, #8A837B)' }}
                >
                    {sortLabel}
                </Label>
                <Select
                    id="scm-reviews-sort"
                    name="sort"
                    data-testid="reviews-filter-sort"
                    value={sort}
                    onChange={(e) => { setPage(1); setSort((e.target as HTMLSelectElement).value as typeof sort); }}
                    style={{
                        padding: '0.45rem 0.65rem',
                        border: '1px solid var(--scm-line, #E4DCCE)',
                        borderRadius: 'var(--scm-radius-sm, 4px)',
                        background: 'var(--scm-surface, #FAF8F3)',
                        fontSize: '0.85rem',
                    }}
                >
                    <option value="created_at_desc">{sortLatestLabel}</option>
                    <option value="rating_desc">{sortRatingHighLabel}</option>
                    <option value="rating_asc">{sortRatingLowLabel}</option>
                </Select>

                <Label
                    htmlFor="scm-reviews-rating"
                    style={{ fontSize: '0.78rem', color: 'var(--scm-text-muted, #8A837B)', marginLeft: '0.5rem' }}
                >
                    {ratingLabel}
                </Label>
                <Select
                    id="scm-reviews-rating"
                    name="rating"
                    data-testid="reviews-filter-rating"
                    value={rating === '' ? '' : String(rating)}
                    onChange={(e) => {
                        const v = (e.target as HTMLSelectElement).value;
                        setPage(1);
                        setRating(v === '' ? '' : Number(v));
                    }}
                    style={{
                        padding: '0.45rem 0.65rem',
                        border: '1px solid var(--scm-line, #E4DCCE)',
                        borderRadius: 'var(--scm-radius-sm, 4px)',
                        background: 'var(--scm-surface, #FAF8F3)',
                        fontSize: '0.85rem',
                    }}
                >
                    <option value="">{anyRatingLabel}</option>
                    {[5, 4, 3, 2, 1].map((n) => (
                        <option key={n} value={String(n)}>{`${n}점`}</option>
                    ))}
                </Select>

                {optionFilters.length > 0 ? (
                    optionFilters.map((of) => (
                        <Select
                            key={`of-${of.key}`}
                            name={`option_filter_${of.key}`}
                            data-testid={`reviews-filter-option-${of.key}`}
                            defaultValue=""
                            style={{
                                padding: '0.45rem 0.65rem',
                                border: '1px solid var(--scm-line, #E4DCCE)',
                                borderRadius: 'var(--scm-radius-sm, 4px)',
                                background: 'var(--scm-surface, #FAF8F3)',
                                fontSize: '0.85rem',
                            }}
                        >
                            <option value="">{`${of.key} (전체)`}</option>
                            {(of.values ?? []).map((v) => (
                                <option key={`${of.key}-${v.value}`} value={String(v.value)}>
                                    {String(v.value)} ({v.count ?? 0})
                                </option>
                            ))}
                        </Select>
                    ))
                ) : null}

                <Label
                    htmlFor="scm-reviews-photo-only"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontSize: '0.78rem',
                        color: 'var(--scm-text-muted, #8A837B)',
                        marginLeft: '0.5rem',
                    }}
                >
                    <Input
                        id="scm-reviews-photo-only"
                        type="checkbox"
                        data-testid="reviews-filter-photo-only"
                        checked={photoOnly}
                        onChange={(e) => { setPage(1); setPhotoOnly((e.target as HTMLInputElement).checked); }}
                    />
                    {photoOnlyLabel}
                </Label>
            </Div>

            {/* List */}
            {loading ? (
                <P style={{ fontSize: '0.85rem', color: 'var(--scm-text-muted, #8A837B)', margin: 0 }}>
                    불러오는 중…
                </P>
            ) : reviews.length === 0 ? (
                <P
                    data-testid="reviews-empty"
                    style={{
                        fontSize: '0.9rem',
                        color: 'var(--scm-text-muted, #8A837B)',
                        margin: 0,
                        padding: 'var(--scm-spacing-md, 1rem)',
                        textAlign: 'center',
                        border: '1px dashed var(--scm-line, #E4DCCE)',
                        borderRadius: 'var(--scm-radius-sm, 4px)',
                    }}
                >
                    {error ?? emptyLabel}
                </P>
            ) : (
                <Div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--scm-spacing-md, 1rem)',
                    }}
                >
                    {reviews.map((r, idx) => (
                        <Div
                            key={String(r.id ?? idx)}
                            data-testid="review-card"
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 'var(--scm-spacing-xs, 0.5rem)',
                                padding: 'var(--scm-spacing-md, 1rem)',
                                border: '1px solid var(--scm-line, #E4DCCE)',
                                borderRadius: 'var(--scm-radius-sm, 4px)',
                                background: 'var(--scm-paper, #FAF8F3)',
                            }}
                        >
                            <Div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: 'var(--scm-spacing-sm, 0.75rem)',
                                    fontSize: '0.82rem',
                                    color: 'var(--scm-text-muted, #8A837B)',
                                }}
                            >
                                <span style={{ fontWeight: 600, color: 'var(--scm-text-body, #4A4643)' }}>
                                    {resolveLabel(r.user?.name) || resolveLabel(r.author_name) || '회원'}
                                </span>
                                <StarBar rating={r.rating ?? 0} />
                            </Div>
                            {r.option_snapshot && r.option_snapshot.length > 0 ? (
                                <Div
                                    style={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: '0.35rem',
                                    }}
                                >
                                    {r.option_snapshot.map((opt, oi) => (
                                        <span
                                            key={oi}
                                            style={{
                                                display: 'inline-block',
                                                padding: '0.15rem 0.5rem',
                                                fontSize: '0.72rem',
                                                color: 'var(--scm-text-muted, #8A837B)',
                                                background: 'var(--scm-surface-2, #F4EFE6)',
                                                borderRadius: 'var(--scm-radius-sm, 4px)',
                                            }}
                                        >
                                            {`${opt.key ?? ''}${opt.key ? ': ' : ''}${opt.value ?? ''}`}
                                        </span>
                                    ))}
                                </Div>
                            ) : null}
                            {r.content ? (
                                <P
                                    style={{
                                        fontSize: '0.9rem',
                                        color: 'var(--scm-text-body, #4A4643)',
                                        margin: 0,
                                        lineHeight: 1.6,
                                        whiteSpace: 'pre-line',
                                    }}
                                >
                                    {r.content}
                                </P>
                            ) : null}
                            {r.images && r.images.length > 0 ? (
                                <Div
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                                        gap: '0.5rem',
                                        marginTop: '0.25rem',
                                    }}
                                >
                                    {r.images.slice(0, 4).map((img, ii) => (
                                        <span
                                            key={String(img.id ?? ii)}
                                            style={{
                                                display: 'block',
                                                aspectRatio: '1 / 1',
                                                background: 'var(--scm-surface-2, #F4EFE6)',
                                                borderRadius: 'var(--scm-radius-sm, 4px)',
                                                overflow: 'hidden',
                                                position: 'relative',
                                            }}
                                        >
                                            {img.thumbnail_url || img.url ? (
                                                <img
                                                    src={img.thumbnail_url ?? img.url}
                                                    alt=""
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover',
                                                        display: 'block',
                                                    }}
                                                />
                                            ) : null}
                                            {ii === 3 && r.images && r.images.length > 4 ? (
                                                <span
                                                    style={{
                                                        position: 'absolute',
                                                        inset: 0,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        background: 'rgba(38, 34, 30, 0.55)',
                                                        color: '#FAF8F3',
                                                        fontWeight: 600,
                                                        fontSize: '0.95rem',
                                                    }}
                                                >
                                                    +{r.images.length - 4}
                                                </span>
                                            ) : null}
                                        </span>
                                    ))}
                                </Div>
                            ) : null}
                            {r.has_reply && r.reply_content ? (
                                <Div
                                    style={{
                                        marginTop: '0.35rem',
                                        padding: 'var(--scm-spacing-sm, 0.75rem)',
                                        background: 'var(--scm-surface-2, #F4EFE6)',
                                        borderRadius: 'var(--scm-radius-sm, 4px)',
                                    }}
                                >
                                    <Span
                                        style={{
                                            fontSize: '0.78rem',
                                            fontWeight: 600,
                                            color: 'var(--scm-wood-dark, #A8916F)',
                                            display: 'block',
                                            marginBottom: '0.2rem',
                                        }}
                                    >
                                        {sellerReplyLabel}
                                    </Span>
                                    <P
                                        style={{
                                            fontSize: '0.85rem',
                                            color: 'var(--scm-text-body, #4A4643)',
                                            margin: 0,
                                            lineHeight: 1.55,
                                            whiteSpace: 'pre-line',
                                        }}
                                    >
                                        {r.reply_content}
                                    </P>
                                </Div>
                            ) : null}
                        </Div>
                    ))}
                </Div>
            )}

            {/* Pagination */}
            {lastPage > 1 ? (
                <Div
                    data-testid="reviews-pagination"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 'var(--scm-spacing-sm, 0.75rem)',
                    }}
                >
                    <Button
                        type="button"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page <= 1}
                        data-testid="reviews-pagination-prev"
                        style={{
                            padding: '0.45rem 0.85rem',
                            background: 'transparent',
                            border: '1px solid var(--scm-line, #E4DCCE)',
                            borderRadius: 'var(--scm-radius-sm, 4px)',
                            color: 'var(--scm-text-body, #4A4643)',
                            fontSize: '0.82rem',
                            cursor: page <= 1 ? 'not-allowed' : 'pointer',
                            opacity: page <= 1 ? 0.55 : 1,
                        }}
                    >
                        {prevLabel}
                    </Button>
                    <Span
                        style={{ fontSize: '0.82rem', color: 'var(--scm-text-muted, #8A837B)' }}
                    >
                        {pageLabel} {page} / {lastPage}
                    </Span>
                    <Button
                        type="button"
                        onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                        disabled={page >= lastPage}
                        data-testid="reviews-pagination-next"
                        style={{
                            padding: '0.45rem 0.85rem',
                            background: 'transparent',
                            border: '1px solid var(--scm-line, #E4DCCE)',
                            borderRadius: 'var(--scm-radius-sm, 4px)',
                            color: 'var(--scm-text-body, #4A4643)',
                            fontSize: '0.82rem',
                            cursor: page >= lastPage ? 'not-allowed' : 'pointer',
                            opacity: page >= lastPage ? 0.55 : 1,
                        }}
                    >
                        {nextLabel}
                    </Button>
                </Div>
            ) : null}
        </Div>
    );
}

export default ProductReviews;