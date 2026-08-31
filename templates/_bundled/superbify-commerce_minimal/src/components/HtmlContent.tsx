import React, { useMemo } from 'react';
// @ts-ignore - DOMPurify 타입 정의 없음 (sirsoft-basic HtmlContent 동일 포크)
import DOMPurify from 'dompurify';
import { Div } from './basic';

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
export function HtmlContent({
    content,
    text,
    isHtml = true,
    className,
    purifyConfig,
}: HtmlContentProps): React.ReactElement | null {
    // text prop이 우선순위가 높음 (레이아웃 JSON에서 사용)
    const actualContent = text ?? content ?? '';

    if (!actualContent || actualContent.trim() === '') {
        return null;
    }

    // isHtml=false: 일반 텍스트 렌더링
    if (!isHtml) {
        return (
            <Div
                className={className}
                data-testid="html-content"
                data-mode="text"
                style={{
                    fontFamily: 'var(--scm-font-body, system-ui)',
                    fontSize: '0.9375rem',
                    lineHeight: 1.8,
                    color: 'var(--scm-text-body, #4A4643)',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                }}
            >
                {actualContent}
            </Div>
        );
    }

    // 기본 DOMPurify 설정 (FORBID 방식: 위험 태그/속성만 차단, 나머지 허용)
    // sirsoft-basic HtmlContent 보안 기본값 그대로 유지 — 위험 태그/속성 목록을
    // 템플릿 임의로 축소하지 않는다.
    const defaultConfig: any = {
        FORBID_TAGS: [
            // 스크립트 실행
            'script', 'noscript',
            // 외부 콘텐츠 삽입
            'iframe', 'frame', 'frameset', 'object', 'embed', 'applet', 'portal',
            // 폼 요소 (피싱 방지)
            'form', 'input', 'textarea', 'select', 'button',
            // 메타/스타일 조작
            'style', 'link', 'meta', 'base',
            // 구조 태그 주입
            'body', 'head', 'html', 'title',
            // SVG/MathML (XSS 벡터)
            'svg', 'math',
            // 미디어 이벤트 핸들러 (onerror, onloadstart)
            'audio', 'video', 'source', 'track', 'canvas',
            // UI 오버레이/이벤트
            'details', 'dialog',
            // HTML 파서 혼란/sanitizer 우회
            'plaintext', 'xmp', 'listing',
            // 레거시/비표준
            'marquee', 'noframes', 'noembed', 'template', 'slot',
        ],
        FORBID_ATTR: [
            'onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur',
            'ontoggle', 'oncanplay', 'onloadstart',
            'formaction', 'xlink:href', 'action',
        ],
        ALLOW_DATA_ATTR: true,
        ADD_ATTR: ['target'],
    };

    // sanitize된 HTML을 메모이제이션
    const sanitizedHtml = useMemo(() => {
        const config = purifyConfig
            ? {
                  ...defaultConfig,
                  ...purifyConfig,
                  // 보안 기본값은 항상 유지 (사용자 설정으로 덮어쓰기 방지)
                  FORBID_TAGS: [...defaultConfig.FORBID_TAGS, ...((purifyConfig.FORBID_TAGS as string[]) ?? [])],
                  FORBID_ATTR: [...defaultConfig.FORBID_ATTR, ...((purifyConfig.FORBID_ATTR as string[]) ?? [])],
              }
            : defaultConfig;
        const cleaned = DOMPurify.sanitize(actualContent, config) as unknown as string;

        // target="_blank" 링크에 rel 속성 추가 (보안)
        return cleaned.replace(
            /<a\s+([^>]*?)href=["']([^"']+)["']([^>]*?)>/gi,
            (match: string, before: string, href: string, after: string) => {
                if (href.startsWith('http://') || href.startsWith('https://')) {
                    if (!match.includes('rel=')) {
                        return `<a ${before}href="${href}"${after} rel="noopener noreferrer">`;
                    }
                }
                return match;
            }
        );
    }, [actualContent, purifyConfig]);

    return (
        <Div
            className={className}
            data-testid="html-content"
            data-mode="html"
            /* sirsoft-basic HtmlContent와 동일한 공식 렌더 채널:
               서버/사용자 HTML을 DOMPurify로 sanitize한 뒤에만 삽입한다. */
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: sanitizedHtml as string }}
        />
    );
}

export default HtmlContent;