import { describe, it, expect } from 'vitest';
import { sanitizeHtml } from '../../src/utils/sanitizeHtml';

describe('sanitizeHtml', () => {
    it('keeps the formatting the board editor produces', () => {
        const result = sanitizeHtml('<p><strong>PurePol SaaS</strong>는 B2B SaaS입니다.</p><p>두 번째 문단</p>');

        expect(result).toContain('<strong>PurePol SaaS</strong>');
        expect(result).toContain('<p>두 번째 문단</p>');
    });

    it('removes script tags and their contents', () => {
        const result = sanitizeHtml('<p>안녕</p><script>alert(document.cookie)</script>');

        expect(result).not.toContain('script');
        expect(result).not.toContain('alert');
        expect(result).toContain('안녕');
    });

    it('removes inline event handlers', () => {
        const result = sanitizeHtml('<p onclick="steal()">본문</p>');

        expect(result).not.toContain('onclick');
        expect(result).toContain('본문');
    });

    it('drops javascript: URLs but keeps ordinary links', () => {
        const result = sanitizeHtml('<a href="javascript:alert(1)">나쁜 링크</a><a href="https://example.com">좋은 링크</a>');

        expect(result).not.toContain('javascript:');
        expect(result).toContain('https://example.com');
    });

    it('drops data: URLs on images', () => {
        const result = sanitizeHtml('<img src="data:text/html;base64,PHNjcmlwdD4=" alt="x">');

        expect(result).not.toContain('data:');
    });

    it('removes iframes and form controls', () => {
        const result = sanitizeHtml('<iframe src="https://evil.example"></iframe><input name="x"><p>남는 문장</p>');

        expect(result).not.toContain('iframe');
        expect(result).not.toContain('<input');
        expect(result).toContain('남는 문장');
    });

    it('unwraps unknown tags but keeps their text', () => {
        const result = sanitizeHtml('<marquee>지나가는 문장</marquee>');

        expect(result).not.toContain('marquee');
        expect(result).toContain('지나가는 문장');
    });

    it('returns an empty string for empty input', () => {
        expect(sanitizeHtml('')).toBe('');
    });
});
