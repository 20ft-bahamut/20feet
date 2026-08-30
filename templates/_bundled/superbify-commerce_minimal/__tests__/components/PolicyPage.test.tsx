import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PolicyPage } from '../../src/components/PolicyPage';
import { businessInfo, getPolicyDocument, localText } from '../../src/config/businessInfo';

describe('PolicyPage', () => {
    it('renders title, eyebrow, sections and paragraphs from config/business-info.json', () => {
        const doc = getPolicyDocument('privacy');
        render(<PolicyPage documentKey="privacy" eyebrow="POLICY" />);
        expect(screen.getByTestId('policy-page')).toHaveAttribute('data-policy', 'privacy');
        expect(screen.getByTestId('policy-page-title')).toHaveTextContent(localText(doc.title));
        expect(screen.getByTestId('policy-page-eyebrow')).toHaveTextContent('POLICY');
        const sections = screen.getAllByTestId('policy-section');
        expect(sections).toHaveLength(doc.sections.length);
        const paragraphs = screen.getAllByTestId('policy-paragraph');
        expect(paragraphs).toHaveLength(
            doc.sections.reduce((n, s) => n + s.paragraphs.length, 0)
        );
        // first section heading matches the JSON source
        expect(screen.getByText(doc.sections[0].heading.ko)).toBeInTheDocument();
    });

    it('renders the honest template-scaffolding note line', () => {
        render(
            <PolicyPage
                documentKey="terms"
                note="본 문서는 템플릿 시안 문구입니다. 실제 운영 전 사업자 상황에 맞는 약관 작성 및 법적 검토가 필요합니다."
            />
        );
        expect(screen.getByTestId('policy-note')).toHaveTextContent(
            '본 문서는 템플릿 시안 문구입니다. 실제 운영 전 사업자 상황에 맞는 약관 작성 및 법적 검토가 필요합니다.'
        );
    });

    it('hides the updated date when it ships empty', () => {
        render(<PolicyPage documentKey="shipping" />);
        expect(screen.queryByTestId('policy-page-updated')).not.toBeInTheDocument();
    });

    it('resolves the en mirror when the document locale is en', () => {
        const doc = businessInfo.policies.terms;
        expect(localText(doc.title, 'en')).toBe('Terms of Service');
        expect(localText(doc.title, 'ko')).toBe('이용약관');
    });
});