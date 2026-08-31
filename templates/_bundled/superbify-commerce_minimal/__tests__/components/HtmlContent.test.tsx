import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HtmlContent } from '../../src/components/HtmlContent';

describe('HtmlContent', () => {
    it('renders sanitized HTML content (no raw tags shown as text, script stripped)', () => {
        render(
            <HtmlContent
                content="<p>결제 완료 후 평일 기준 2 영업일 내에 출고됩니다.</p><script>alert(1)</script>"
                isHtml={true}
            />
        );

        const node = screen.getByTestId('html-content');
        expect(node).toHaveAttribute('data-mode', 'html');
        expect(node).toHaveTextContent('결제 완료 후 평일 기준 2 영업일 내에 출고됩니다.');
        expect(node.querySelector('p')).not.toBeNull();
        expect(node.querySelector('script')).toBeNull();
        expect(node.textContent).not.toContain('<p>');
    });

    it('strips event handler attributes', () => {
        render(
            <HtmlContent
                content={'<img src=x onerror="alert(1)"><p>본문</p>'}
                isHtml={true}
            />
        );
        const node = screen.getByTestId('html-content');
        const img = node.querySelector('img');
        expect(img).not.toBeNull();
        expect(img?.getAttribute('onerror')).toBeNull();
    });

    it('renders plain text with preserved line breaks when isHtml is false', () => {
        render(<HtmlContent content="첫 줄\n둘째 줄" isHtml={false} />);
        const node = screen.getByTestId('html-content');
        expect(node).toHaveAttribute('data-mode', 'text');
        expect(node.textContent).toContain('둘째 줄');
        expect(node.querySelector('p')).toBeNull();
    });

    it('returns null for empty content', () => {
        const { container } = render(<HtmlContent content="   " />);
        expect(container).toBeEmptyDOMElement();
    });

    it('prefers the text prop over content', () => {
        render(<HtmlContent content="<p>ignored</p>" text="텍스트 우선" isHtml={false} />);
        expect(screen.getByTestId('html-content')).toHaveTextContent('텍스트 우선');
    });
});