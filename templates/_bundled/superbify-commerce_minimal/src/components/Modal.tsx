import React, { useEffect } from 'react';
import { Button, Div, P } from './basic';

/**
 * Modal — 레이아웃 `modals` 배열에 선언된 partial 을 엔진이 렌더링할 때
 * isOpen / onClose 가 자동 주입된다(core template-engine.ts 의 modalStack 주입 계약).
 * sirsoft-basic src/components/composite/Modal.tsx 의 포크 — Tailwind 클래스를
 * var(--scm-*) 디자인 토큰으로 치환 Still Form 규칙 적용.
 */
export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    /** "sm" | "md" | "lg" — layout JSON 의 size prop (sirsoft-basic 계약). */
    size?: string;
    /** Overay(백드롭) 클릭 시 닫기 여부. */
    closeOnOverlayClick?: boolean;
    /** ESC 키 닫기 허용 여부. */
    closeOnEscape?: boolean;
    /** 헤더 닫기 버튼 표시 여부. */
    showCloseButton?: boolean;
    /** layout JSON width prop (e.g. "600px"). */
    width?: string;
    children?: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
}

const SIZE_WIDTH: Record<string, string> = {
    sm: '420px',
    md: '560px',
    lg: '760px',
};

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    size,
    closeOnOverlayClick = true,
    closeOnEscape = true,
    showCloseButton = true,
    children,
    width,
    className,
    style,
}) => {

    useEffect(() => {
        if (!isOpen || !closeOnEscape) return;
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose, closeOnEscape]);

    // body 스크롤 방지
    useEffect(() => {
        if (!isOpen) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prev;
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const resolvedWidth = width ?? SIZE_WIDTH[size ?? 'md'] ?? SIZE_WIDTH.md;

    return (
        <Div
            className="scm-modal-root"
            style={{ zIndex: style?.zIndex ?? 60 }}
        >
            <Div
                className="scm-modal-overlay"
                onClick={closeOnOverlayClick ? onClose : undefined}
                data-testid="scm-modal-overlay"
            />
            <Div
                className={className ? `scm-modal-panel ${className}` : 'scm-modal-panel'}
                style={{ maxWidth: resolvedWidth }}
                role="dialog"
                aria-modal="true"
                aria-label={title}
            >
                <Div className="scm-modal-head">
                    {title ? (
                        <P className="scm-modal-title">{title}</P>
                    ) : <span />}
                    {showCloseButton ? (
                        <Button
                            type="button"
                            onClick={onClose}
                            className="scm-modal-close"
                            aria-label="닫기"
                            data-testid="scm-modal-close"
                        >
                            ✕
                        </Button>
                    ) : null}
                </Div>
                <Div className="scm-modal-body">{children}</Div>
            </Div>
        </Div>
    );
};

export default Modal;