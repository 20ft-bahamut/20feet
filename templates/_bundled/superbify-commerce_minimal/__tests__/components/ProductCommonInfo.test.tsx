import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProductCommonInfo } from '../../src/components/ProductCommonInfo';

const baseCommonInfo = {
    name: '일반 배송 안내',
    content:
        '• 배송 기간: 결제 완료 후 1~3일\n' +
        '• 배송 방법: CJ대한통운\n' +
        '• 배송 지역: 전국 (도서산간 제외)\n' +
        '• 배송 추적: 마이페이지 > 주문내역\n' +
        '• 배송 비용: 3만원 이상 무료',
    content_mode: 'text',
} as const;

const baseNotice = {
    template_name: '의류',
    values: [
        { label: '제품 소재(섬유의 조성 또는 혼용률)', value: '상세페이지 참조' },
        { label: '색상', value: '상세페이지 참조' },
        { label: '치수', value: '상세페이지 참조' },
        { label: '제조자(수입자)', value: '상세페이지 참조' },
        { label: '제조국', value: '상세페이지 참조' },
        { label: '세탁방법 및 취급시 주의사항', value: '상세페이지 참조' },
        { label: '제조연월', value: '고객센터 문의' },
        { label: '품질보증기준', value: '제품 이상 시 공정거래위원회 고시에 따라 보상' },
        { label: 'A/S 책임자와 전화번호', value: '고객센터 문의' },
    ],
} as const;

describe('ProductCommonInfo', () => {
    it('renders common-info title and pre-line text content', () => {
        render(<ProductCommonInfo commonInfo={{...baseCommonInfo}} />);
        expect(screen.getByTestId('product-common-info')).toBeInTheDocument();
        expect(screen.getByTestId('product-common-info-content-text')).toHaveTextContent(
            'CJ대한통운',
        );
        expect(screen.getByText('일반 배송 안내')).toBeInTheDocument();
    });

    it('renders notice table with one row per value pair', () => {
        render(<ProductCommonInfo notice={{...baseNotice}} />);
        const rows = screen.getAllByTestId('product-notice-row-value');
        expect(rows).toHaveLength(9);
        expect(screen.getByText('제품 소재(섬유의 조성 또는 혼용률)')).toBeInTheDocument();
        expect(screen.getByText('품질보증기준')).toBeInTheDocument();
        expect(screen.getAllByText(/공정거래위원회/).length).toBeGreaterThan(0);
        expect(screen.getByTestId('product-notice-template-name')).toHaveTextContent('의류');
    });

    it('renders both subsections together when both data are present', () => {
        render(<ProductCommonInfo commonInfo={{...baseCommonInfo}} notice={{...baseNotice}} />);
        expect(screen.getByTestId('product-common-info')).toBeInTheDocument();
        expect(screen.getByTestId('product-notice-items')).toBeInTheDocument();
        expect(screen.getByTestId('product-common-info-notice')).toBeInTheDocument();
    });

    it('hides common-info subsection when content is empty', () => {
        render(
            <ProductCommonInfo
                commonInfo={{ name: '', content: '', content_mode: 'text' }}
                notice={{...baseNotice}}
            />,
        );
        expect(screen.queryByTestId('product-common-info')).not.toBeInTheDocument();
        expect(screen.getByTestId('product-notice-items')).toBeInTheDocument();
    });

    it('hides notice subsection when values array is empty', () => {
        render(
            <ProductCommonInfo
                commonInfo={{...baseCommonInfo}}
                notice={{ template_name: '', values: [] }}
            />,
        );
        expect(screen.getByTestId('product-common-info')).toBeInTheDocument();
        expect(screen.queryByTestId('product-notice-items')).not.toBeInTheDocument();
    });

    it('returns null when both data are absent (empty-state)', () => {
        const { container } = render(
            <ProductCommonInfo commonInfo={null} notice={null} />,
        );
        expect(container.firstChild).toBeNull();
        expect(screen.queryByTestId('product-common-info-notice')).not.toBeInTheDocument();
    });

    it('returns null when both data are undefined', () => {
        const { container } = render(<ProductCommonInfo />);
        expect(container.firstChild).toBeNull();
    });

    it('renders localized name object {ko, en} as ko first', () => {
        render(
            <ProductCommonInfo
                commonInfo={{
                    name: { ko: '일반 배송 안내', en: 'Standard shipping' },
                    content: '국제 배송 안내 본문',
                    content_mode: 'text',
                }}
            />,
        );
        expect(screen.getByText('일반 배송 안내')).toBeInTheDocument();
        expect(screen.queryByText('Standard shipping')).not.toBeInTheDocument();
    });

    it('skips notice rows whose label or value are empty', () => {
        render(
            <ProductCommonInfo
                notice={{
                    template_name: '의류',
                    values: [
                        { label: '색상', value: '상세페이지 참조' },
                        { label: '', value: 'ghost' },
                        { label: 'ghost', value: '' },
                        { label: '치수', value: 'Free' },
                    ],
                }}
            />,
        );
        const rows = screen.getAllByTestId('product-notice-row-value');
        expect(rows).toHaveLength(2);
        expect(screen.queryByText('ghost')).not.toBeInTheDocument();
    });

    it('renders html content via dangerouslySetInnerHTML when content_mode=html', () => {
        render(
            <ProductCommonInfo
                commonInfo={{
                    name: '공지',
                    content: '<strong data-testid="html-strong">HTML</strong>',
                    content_mode: 'html',
                }}
            />,
        );
        expect(screen.getByTestId('product-common-info-content-html')).toBeInTheDocument();
        expect(screen.getByTestId('html-strong')).toBeInTheDocument();
    });
});