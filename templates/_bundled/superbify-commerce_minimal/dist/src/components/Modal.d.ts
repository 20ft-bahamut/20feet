import { default as React } from 'react';
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
export declare const Modal: React.FC<ModalProps>;
export default Modal;
