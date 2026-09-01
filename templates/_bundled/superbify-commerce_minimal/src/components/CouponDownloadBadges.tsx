import React, { useCallback, useMemo, useState } from 'react';
import { Button, Div, Span } from './basic';

export interface CouponDownloadBadgesCoupon {
    coupon_id: number | string;
    localized_name?: string;
    benefit_formatted?: string;
    multi_currency_benefit_formatted?: Record<string, { formatted?: string } | string>;
    target_type_short_label?: string;
    is_downloaded?: boolean;
}

export interface CouponDownloadBadgesProps {
    coupons: CouponDownloadBadgesCoupon[];
    isLoggedIn: boolean;
    guestMessage?: string;
    memberLoginRedirectPath?: string;
    loginRequiredToastMessage?: string;
    downloadSuccessMessage?: string;
    downloadFailedMessage?: string;
    maxVisible?: number;
    className?: string;
}

interface G7CoreLike {
    api?: { getToken?: () => string | null };
    toast?: {
        success?: (msg: string) => void;
        error?: (msg: string) => void;
        info?: (msg: string) => void;
        show?: (msg: string, opts?: { type?: string }) => void;
    };
    dataSource?: { refetch?: (id: string, opts?: Record<string, unknown>) => void };
}

function showToast(type: 'success' | 'error', message: string): void {
    const g7 = (window as unknown as { G7Core?: G7CoreLike }).G7Core;
    try {
        const fn = g7?.toast?.[type];
        if (typeof fn === 'function') {
            fn(message);
            return;
        }
        if (typeof g7?.toast?.show === 'function') {
            g7.toast.show(message, { type });
            return;
        }
    } catch {
        /* fallthrough */
    }
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

function resolveBenefitLabel(
    coupon: CouponDownloadBadgesCoupon,
): string {
    const multi = coupon.multi_currency_benefit_formatted;
    if (multi && typeof multi === 'object' && !Array.isArray(multi)) {
        const ko = (multi as Record<string, { formatted?: string } | string>)['ko'];
        const first = (multi as Record<string, { formatted?: string } | string>)[
            Object.keys(multi as Record<string, unknown>)[0] ?? ''
        ];
        if (ko && typeof ko === 'object' && (ko as { formatted?: string }).formatted) {
            return (ko as { formatted?: string }).formatted as string;
        }
        if (first && typeof first === 'object' && (first as { formatted?: string }).formatted) {
            return (first as { formatted?: string }).formatted as string;
        }
    }
    return coupon.benefit_formatted ?? '';
}

function showDownloadedState(benefit: string): React.ReactElement {
    return (
        <>
            <Span style={{ whiteSpace: 'nowrap' }}>{benefit}</Span>
            <Span aria-hidden="true" style={{ fontSize: '0.78em' }}>✓</Span>
        </>
    );
}

function showAvailableState(benefit: string): React.ReactElement {
    return (
        <>
            <Span style={{ whiteSpace: 'nowrap' }}>{benefit}</Span>
            <Span aria-hidden="true" style={{ fontSize: '0.78em' }}>↓</Span>
        </>
    );
}

/**
 * Coupon download badge list on product detail.
 *
 * Mirrors sirsoft-basic _info_summary.json coupon chip block, rendered as a
 * composite so the layout engine does not have to express the POST action.
 *
 * Guest → toast '로그인이 필요합니다.' + redirect /login.
 * Member → POST /api/modules/sirsoft-ecommerce/user/coupons/{coupon_id}/download.
 * On success, refetch the `productDownloadableCoupons` data source so the
 * badge flips to the downloaded state and any other open modal stays in sync.
 *
 * Style uses Still Form design tokens (--scm-*). The list is hidden when
 * `coupons` is empty so the parent layout does not need a guard.
 */
export function CouponDownloadBadges(props: CouponDownloadBadgesProps): React.ReactElement | null {
    const {
        coupons,
        isLoggedIn,
        guestMessage = '로그인이 필요합니다.',
        memberLoginRedirectPath,
        loginRequiredToastMessage = '로그인이 필요합니다.',
        downloadSuccessMessage = '쿠폰이 다운로드되었습니다.',
        downloadFailedMessage = '쿠폰 다운로드에 실패했습니다.',
        maxVisible = 3,
        className,
    } = props;

    const [busyId, setBusyId] = useState<string | number | null>(null);
    const [localDownloaded, setLocalDownloaded] = useState<Record<string, boolean>>({});

    const visible = useMemo(() => (Array.isArray(coupons) ? coupons.slice(0, maxVisible) : []), [coupons, maxVisible]);
    const overflow = useMemo(() => {
        if (!Array.isArray(coupons)) return 0;
        return Math.max(0, coupons.length - maxVisible);
    }, [coupons, maxVisible]);

    const handleDownload = useCallback(
        async (coupon: CouponDownloadBadgesCoupon) => {
            if (!coupon?.coupon_id) return;
            const isAlreadyDownloaded = localDownloaded[String(coupon.coupon_id)] ?? coupon.is_downloaded;
            if (isAlreadyDownloaded) return;

            if (!isLoggedIn) {
                showToast('error', loginRequiredToastMessage);
                const redirectPath = memberLoginRedirectPath
                    ?? (typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/shop');
                try {
                    window.location.assign('/login?redirect=' + encodeURIComponent(redirectPath));
                } catch {
                    /* noop */
                }
                return;
            }

            setBusyId(coupon.coupon_id);
            const token = getToken();
            try {
                const res = await fetch(
                    `/api/modules/sirsoft-ecommerce/user/coupons/${encodeURIComponent(String(coupon.coupon_id))}/download`,
                    {
                        method: 'POST',
                        credentials: 'same-origin',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            ...(token ? { Authorization: `Bearer ${token}` } : {}),
                        },
                    },
                );
                if (!res.ok) {
                    let msg = `HTTP ${res.status}`;
                    try {
                        const body = await res.json();
                        msg = body?.errors?.message ?? body?.message ?? msg;
                    } catch { /* ignore */ }
                    showToast('error', msg || downloadFailedMessage);
                    return;
                }
                setLocalDownloaded((prev) => ({ ...prev, [String(coupon.coupon_id)]: true }));
                showToast('success', downloadSuccessMessage);
                try {
                    const g7 = (window as unknown as { G7Core?: G7CoreLike }).G7Core;
                    g7?.dataSource?.refetch?.('productDownloadableCoupons', { skipCache: true });
                    g7?.dataSource?.refetch?.('product_detail', { skipCache: true });
                } catch { /* noop */ }
            } catch (err) {
                showToast('error', (err as Error)?.message ?? downloadFailedMessage);
            } finally {
                setBusyId(null);
            }
        },
        [isLoggedIn, loginRequiredToastMessage, downloadSuccessMessage, downloadFailedMessage, localDownloaded, memberLoginRedirectPath],
    );

    if (!visible.length) return null;

    return (
        <Div
            data-testid="coupon-download-badges"
            className={className}
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--scm-spacing-xs, 0.5rem)',
                paddingBlock: 'var(--scm-spacing-sm, 0.5rem)',
                borderTop: '1px solid var(--scm-line, #E4DCCE)',
                borderBottom: '1px solid var(--scm-line, #E4DCCE)',
            }}
        >
            <Div
                style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: '0.4rem',
                }}
            >
                <Span
                    aria-hidden="true"
                    style={{
                        fontSize: '0.85rem',
                        color: 'var(--scm-wood-dark, #A8916F)',
                        marginRight: '0.15rem',
                    }}
                >
                    ◐
                </Span>
                {visible.map((coupon) => {
                    const benefit = resolveBenefitLabel(coupon);
                    const downloaded = localDownloaded[String(coupon.coupon_id)] ?? coupon.is_downloaded;
                    const busy = busyId === coupon.coupon_id;
                    return (
                        <Button
                            key={`coupon-${coupon.coupon_id}`}
                            type="button"
                            data-testid="coupon-badge"
                            data-coupon-id={coupon.coupon_id}
                            data-downloaded={downloaded ? 'true' : 'false'}
                            disabled={downloaded || busy}
                            aria-label={coupon.localized_name ?? `쿠폰 ${benefit}`}
                            onClick={() => handleDownload(coupon)}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                padding: '0.3rem 0.65rem',
                                fontSize: '0.78rem',
                                fontWeight: 500,
                                fontFamily: 'var(--scm-font-body, system-ui)',
                                borderRadius: '999px',
                                border: downloaded
                                    ? '1px solid var(--scm-line, #E4DCCE)'
                                    : '1px solid var(--scm-wood-dark, #A8916F)',
                                background: downloaded
                                    ? 'var(--scm-surface-2, #F4EFE6)'
                                    : 'var(--scm-paper, #FAF8F3)',
                                color: downloaded
                                    ? 'var(--scm-text-muted, #8A837B)'
                                    : 'var(--scm-text-primary, #26221E)',
                                cursor: downloaded ? 'default' : (busy ? 'wait' : 'pointer'),
                                lineHeight: 1.2,
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {downloaded ? showDownloadedState(benefit) : showAvailableState(benefit)}
                        </Button>
                    );
                })}
                {overflow > 0 ? (
                    <Span
                        data-testid="coupon-badge-overflow"
                        style={{
                            fontSize: '0.78rem',
                            color: 'var(--scm-text-muted, #8A837B)',
                            marginLeft: '0.25rem',
                        }}
                    >
                        {`+${overflow}`}
                    </Span>
                ) : null}
            </Div>
            {!isLoggedIn ? (
                <Span
                    data-testid="coupon-badge-guest-hint"
                    style={{
                        fontSize: '0.72rem',
                        color: 'var(--scm-text-muted, #8A837B)',
                    }}
                >
                    {guestMessage}
                </Span>
            ) : null}
        </Div>
    );
}

export default CouponDownloadBadges;