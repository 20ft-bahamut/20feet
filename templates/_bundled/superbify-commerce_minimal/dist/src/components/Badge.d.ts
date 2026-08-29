import { default as React } from 'react';
export type BadgeTone = 'default' | 'discount' | 'discount-soft' | 'soldout' | 'stopped' | 'new';
export interface BadgeProps {
    label: string;
    tone?: BadgeTone;
    className?: string;
}
export declare function Badge({ label, tone, className }: BadgeProps): React.ReactElement;
export default Badge;
