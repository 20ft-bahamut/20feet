import { default as React } from 'react';
export interface ConfirmDialogProps {
    open: boolean;
    title?: string;
    message?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    /** Fired with no args when confirm is clicked. The page-level handler dispatches the API call. */
    onConfirm?: () => void;
    onCancel?: () => void;
    busy?: boolean;
    /** 'danger' | 'default' */
    tone?: 'danger' | 'default';
    className?: string;
}
/**
 * Lightweight confirm modal. Template-styled. The dialog itself is always
 * rendered into the tree; visibility controlled by `open`. Backdrop click +
 * ESC close map to onCancel.
 *
 * Used by cart page for delete confirmation, matching the G7 Modal pattern
 * (target field) without requiring engine-side Modal support to exist.
 */
export declare function ConfirmDialog({ open, title, message, confirmLabel, cancelLabel, onConfirm, onCancel, busy, tone, className, }: ConfirmDialogProps): React.ReactElement | null;
export default ConfirmDialog;
