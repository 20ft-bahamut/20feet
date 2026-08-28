import React from 'react';
import { Button, Div, H3, P, Span } from './basic';

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
export function ConfirmDialog({
    open,
    title,
    message,
    confirmLabel = '확인',
    cancelLabel = '취소',
    onConfirm,
    onCancel,
    busy,
    tone = 'danger',
    className,
}: ConfirmDialogProps): React.ReactElement | null {
    React.useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !busy) onCancel?.();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, busy, onCancel]);

    if (!open) return null;

    const confirmBg = tone === 'danger' ? 'var(--scm-charcoal, #26221E)' : 'var(--scm-wood, #C9B08D)';
    const confirmBorder = tone === 'danger' ? 'var(--scm-charcoal, #26221E)' : 'var(--scm-wood, #C9B08D)';

    return (
        <Div
            role="dialog"
            aria-modal="true"
            aria-labelledby="scm-confirm-title"
            data-testid="confirm-dialog"
            className={className}
            onClick={(e) => {
                if (e.target === e.currentTarget && !busy) onCancel?.();
            }}
            style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(38, 34, 30, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: 'var(--scm-spacing-md, 1rem)',
            }}
        >
            <Div
                style={{
                    backgroundColor: 'var(--scm-paper, #FAF8F3)',
                    borderRadius: 'var(--scm-radius, 8px)',
                    border: '1px solid var(--scm-line, #E4DCCE)',
                    maxWidth: '420px',
                    width: '100%',
                    padding: 'var(--scm-spacing-lg, 1.5rem)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--scm-spacing-md, 1rem)',
                }}
            >
                <H3
                    id="scm-confirm-title"
                    style={{
                        fontFamily: 'var(--scm-font-display, system-ui)',
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        color: 'var(--scm-text-primary, #26221E)',
                        margin: 0,
                    }}
                >
                    {title}
                </H3>
                {message ? (
                    <P
                        style={{
                            fontFamily: 'var(--scm-font-body, system-ui)',
                            fontSize: '0.9rem',
                            color: 'var(--scm-text-body, #4A4643)',
                            margin: 0,
                            lineHeight: 1.5,
                        }}
                    >
                        {message}
                    </P>
                ) : null}
                <Div
                    style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: 'var(--scm-spacing-sm, 0.75rem)',
                        marginTop: 'var(--scm-spacing-xs, 0.5rem)',
                    }}
                >
                    <Button
                        type="button"
                        onClick={onCancel}
                        disabled={busy}
                        data-testid="confirm-cancel"
                        style={{
                            padding: '0.55rem 1rem',
                            background: 'transparent',
                            border: '1px solid var(--scm-line, #E4DCCE)',
                            borderRadius: 'var(--scm-radius-sm, 4px)',
                            color: 'var(--scm-text-body, #4A4643)',
                            fontWeight: 500,
                            fontSize: '0.85rem',
                            cursor: busy ? 'not-allowed' : 'pointer',
                        }}
                    >
                        {cancelLabel}
                    </Button>
                    <Button
                        type="button"
                        onClick={onConfirm}
                        disabled={busy}
                        data-testid="confirm-ok"
                        style={{
                            padding: '0.55rem 1rem',
                            backgroundColor: confirmBg,
                            border: `1px solid ${confirmBorder}`,
                            borderRadius: 'var(--scm-radius-sm, 4px)',
                            color: 'var(--scm-text-inverse, #FAF8F3)',
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            cursor: busy ? 'not-allowed' : 'pointer',
                            opacity: busy ? 0.6 : 1,
                        }}
                    >
                        <Span>{busy ? '처리 중…' : confirmLabel}</Span>
                    </Button>
                </Div>
            </Div>
        </Div>
    );
}

export default ConfirmDialog;
