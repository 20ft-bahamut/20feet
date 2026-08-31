import { default as React } from 'react';
export interface HtmlContentProps {
    /** 콘텐츠 (HTML 또는 일반 텍스트) */
    content?: string;
    /**
     * content가 HTML 형식인지 여부.
     * - true: HTML 렌더링 (DOMPurify 적용, .scm-rich-content 스타일)
     * - false: 일반 텍스트 (whitespace-pre-wrap 줄바꿈 보존)
     * @default true
     */
    isHtml?: boolean;
    /** 사용자 정의 클래스 */
    className?: string;
    /** DOMPurify 설정 오버라이드 (isHtml=true일 때만 사용) */
    purifyConfig?: Record<string, unknown>;
    /**
     * 레이아웃 JSON에서 text 속성으로 전달되는 콘텐츠 (content보다 우선)
     */
    text?: string;
}
/**
 * HtmlContent — 게시글/공지 본문 렌더링 composite.
 *
 * sirsoft-basic 공식 HtmlContent(security 패턴)의 Still Form 포크:
 * HTML과 일반 텍스트를 안전하게 렌더링한다.
 * - isHtml=true: DOMPurify로 위험 태그/속성을 차단한 뒤 렌더링
 *   (module 보드 API의 content_mode='html' 채널에 대응)
 * - isHtml=false: 줄바꿈을 보존하는 일반 텍스트
 *
 * 시각 스타일은 전역 design-tokens.css 의 `.scm-rich-content` 규칙을 사용한다.
 */
export declare function HtmlContent({ content, text, isHtml, className, purifyConfig, }: HtmlContentProps): React.ReactElement | null;
export default HtmlContent;
