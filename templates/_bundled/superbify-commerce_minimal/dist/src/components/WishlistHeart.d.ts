import { default as React } from 'react';
export interface WishlistHeartProps {
    productId: number | string;
    isWishlisted: boolean;
    isLoggedIn: boolean;
    toastGuestLabel?: string;
    className?: string;
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
export declare function WishlistHeart({ productId, isWishlisted, isLoggedIn, toastGuestLabel, className, }: WishlistHeartProps): React.ReactElement;
export default WishlistHeart;
