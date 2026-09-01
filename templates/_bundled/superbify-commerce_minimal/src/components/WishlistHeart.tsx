import React, { useCallback, useState } from 'react';
import { Button } from './basic';

export interface WishlistHeartProps {
    productId: number | string;
    isWishlisted: boolean;
    isLoggedIn: boolean;
    toastGuestLabel?: string;
    className?: string;
}

interface G7CoreLike {
    api?: { getToken?: () => string | null };
    state?: { set?: (u: Record<string, unknown>) => void };
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

/**
 * Wishlist heart toggle on product detail.
 *
 * Guest → G7Core.toast.error + redirect to /login?redirect=<current path>.
 * Member → optimistic toggle + POST /api/modules/sirsoft-ecommerce/wishlist/toggle
 * (Bearer via G7Core.api.getToken). On success, sync with response.data.added;
 * on failure, roll back. aria-pressed reflects state, data-testid="wishlist-heart".
 *
 * Style follows AddToCartPanel's scm tokens. Glyphs use plain text ♥/♡ (no
 * Icon composite dependency).
 */
export function WishlistHeart({
    productId,
    isWishlisted,
    isLoggedIn,
    toastGuestLabel = '로그인이 필요합니다.',
    className,
}: WishlistHeartProps): React.ReactElement {
    const [active, setActive] = useState<boolean>(!!isWishlisted);
    const [busy, setBusy] = useState<boolean>(false);

    const handleClick = useCallback(
        async (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            if (!isLoggedIn) {
                showToast('error', toastGuestLabel);
                try {
                    window.location.assign('/login?redirect=' + encodeURIComponent(window.location.pathname));
                } catch {
                    /* noop */
                }
                return;
            }
            if (busy) return;
            const next = !active;
            setBusy(true);
            // Optimistic
            setActive(next);
            const token = getToken();
            try {
                const res = await fetch('/api/modules/sirsoft-ecommerce/wishlist/toggle', {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                    body: JSON.stringify({ product_id: productId }),
                });
                if (!res.ok) {
                    // Rollback
                    setActive(!next);
                    let msg = `HTTP ${res.status}`;
                    try {
                        const body = await res.json();
                        msg = body?.errors?.message ?? body?.message ?? msg;
                    } catch { /* ignore */ }
                    showToast('error', msg);
                    return;
                }
                const body = await res.json().catch(() => ({}));
                const added = body?.data?.added;
                if (typeof added === 'boolean') setActive(added);
                showToast('success', added ? '찜 목록에 추가했습니다.' : '찜 목록에서 제거했습니다.');
                // Trigger product DS refetch (server-side is_wishlisted sync)
                try {
                    const g7 = (window as unknown as { G7Core?: G7CoreLike }).G7Core;
                    g7?.dataSource?.refetch?.('product_detail', { skipCache: true });
                } catch { /* noop */ }
            } catch (err) {
                setActive(!next);
                showToast('error', (err as Error)?.message ?? 'Network error');
            } finally {
                setBusy(false);
            }
        },
        [isLoggedIn, busy, active, productId, toastGuestLabel],
    );

    const glyph = active ? '♥' : '♡';
    const label = active ? '찜 해제' : '찜 추가';

    return (
        <Button
            type="button"
            onClick={handleClick}
            aria-pressed={active}
            aria-label={label}
            title={label}
            disabled={busy}
            data-testid="wishlist-heart"
            data-wishlisted={active ? 'true' : 'false'}
            data-product-id={productId}
            className={className}
            style={{
                padding: '0.45rem 0.7rem',
                background: 'transparent',
                border: '1px solid var(--scm-line, #E4DCCE)',
                borderRadius: 'var(--scm-radius, 8px)',
                color: active ? 'var(--scm-error, #B85450)' : 'var(--scm-text-muted, #8A837B)',
                fontSize: '1.1rem',
                lineHeight: 1,
                cursor: busy ? 'wait' : 'pointer',
                fontFamily: 'var(--scm-font-body, system-ui)',
            }}
        >
            <span aria-hidden="true">{glyph}</span>
        </Button>
    );
}

export default WishlistHeart;