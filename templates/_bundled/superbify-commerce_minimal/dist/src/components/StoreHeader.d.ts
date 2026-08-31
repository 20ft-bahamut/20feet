import { default as React } from 'react';
export interface StoreHeaderProps {
    brandName?: string;
    tagline?: string;
    /** Cart count for the cart badge; undefined hides the badge. */
    cartCount?: number;
    /** Logged-in user display name (nick_name ?? name ?? email). Empty/null/missing => logged out. */
    user?: string | null;
    loginLabel?: string;
    signupLabel?: string;
    mypageLabel?: string;
    logoutLabel?: string;
    className?: string;
}
export declare function StoreHeader({ brandName, tagline, cartCount, user, loginLabel, signupLabel, mypageLabel, logoutLabel, className, }: StoreHeaderProps): React.ReactElement;
export default StoreHeader;
