import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { StoreFooter } from '../../src/components/StoreFooter';
import type { BusinessField } from '../../src/config/businessInfo';

/** Test fixture builder — mirrors businessFields() output shape. */
function makeField(overrides: Partial<BusinessField> & { label_key: string }): BusinessField {
    return {
        label: overrides.label_key,
        value: 'value',
        ...overrides,
    } as BusinessField;
}

const FULL_FIELDS: BusinessField[] = [
    makeField({ label_key: 'shopName', label: '상점명', value: '예시 상점' }),
    makeField({ label_key: 'businessRegistrationNumber', label: '사업자등록번호', value: '123-45-67890' }),
    makeField({ label_key: 'businessAddress', label: '사업장 주소', value: '예시 주소 1-2-3' }),
    makeField({ label_key: 'customerServicePhone', label: '고객센터 전화', value: '000-0000-0000', href: 'tel:00000000000' }),
];

describe('StoreFooter — business info conditional rendering', () => {
    it('CASE 1: keeps the classic rows (sr-free brand, nav, policy links, copyright)', () => {
        render(<StoreFooter brandName="Still Form" />);
        expect(screen.getByTestId('store-footer')).toBeInTheDocument();
        expect(screen.getByText('Still Form')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Shop' })).toBeInTheDocument();
        expect(screen.getByText('© 2026 Still Form — demo store built on Gnuboard 7')).toBeInTheDocument();
        expect(screen.getByTestId('footer-policy-terms')).toBeInTheDocument();
        expect(screen.getByTestId('footer-policy-privacy')).toBeInTheDocument();
        expect(screen.getByTestId('footer-policy-shipping')).toBeInTheDocument();
    });

    it('CASE 1: renders the business info grid when fields are set', () => {
        render(
            <StoreFooter
                infoFields={FULL_FIELDS}
                demoNotice="데모 스토어입니다. 사업자 정보는 템플릿 config/business-info.json에서 설정할 수 있습니다."
            />
        );
        const info = screen.getByTestId('footer-business-info');
        expect(within(info).getAllByTestId('footer-business-field')).toHaveLength(4);
        expect(within(info).getByText('123-45-67890')).toBeInTheDocument();
        // leading-zero / dash preservation: value rendered verbatim, not reformatted
        expect(within(info).getByText('000-0000-0000')).toBeInTheDocument();
        // demo-store notice shows alongside business info too (seed values are demo)
        expect(screen.getByTestId('footer-demo-notice')).toBeInTheDocument();
    });

    it('CASE 1: phone and email fields render as real anchors (no div onClick)', () => {
        render(
            <StoreFooter
                infoFields={[
                    makeField({ label_key: 'customerServicePhone', label: '고객센터 전화', value: '000-0000-0000', href: 'tel:00000000000' }),
                    makeField({ label_key: 'customerServiceEmail', label: '고객센터 이메일', value: 'hello@example.test', href: 'mailto:hello@example.test' }),
                ]}
            />
        );
        const phone = screen.getByRole('link', { name: '000-0000-0000' });
        expect(phone).toHaveAttribute('href', 'tel:00000000000');
        const email = screen.getByRole('link', { name: 'hello@example.test' });
        expect(email).toHaveAttribute('href', 'mailto:hello@example.test');
    });

    it('CASE 2: skips an empty ecommerce registration number but keeps other rows', () => {
        const fields = [
            makeField({ label_key: 'shopName', label: '상점명', value: '예시 상점' }),
        ];
        render(<StoreFooter infoFields={fields} />);
        expect(screen.getByTestId('footer-business-info')).toBeInTheDocument();
        expect(screen.queryByText('통신판매업신고번호')).not.toBeInTheDocument();
        expect(screen.queryByTestId('footer-business-verification')).not.toBeInTheDocument();
    });

    it('CASE 3: renders the verification link with rel attributes only when a URL is set', () => {
        render(
            <StoreFooter
                infoFields={[
                    makeField({
                        label_key: 'businessVerification',
                        label: '사업자정보확인',
                        value: 'https://example.test/verify',
                        href: 'https://example.test/verify',
                        external: true,
                    }),
                ]}
            />
        );
        const link = screen.getByTestId('footer-business-verification');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
        expect(link).toHaveAttribute('target', '_blank');
    });

    it('CASE 3 (inverse): no verification link when the URL is empty', () => {
        render(<StoreFooter infoFields={FULL_FIELDS} />);
        expect(screen.queryByTestId('footer-business-verification')).not.toBeInTheDocument();
    });

    it('CASE 4: all empty → info block absent, demo notice shown, footer intact', () => {
        render(
            <StoreFooter
                infoFields={[]}
                demoNotice="데모 스토어입니다. 사업자 정보는 템플릿 config/business-info.json에서 설정할 수 있습니다."
            />
        );
        expect(screen.queryByTestId('footer-business-info')).not.toBeInTheDocument();
        expect(screen.queryByTestId('footer-business-field')).not.toBeInTheDocument();
        expect(screen.queryByTestId('footer-business-verification')).not.toBeInTheDocument();
        expect(screen.getByTestId('footer-demo-notice')).toHaveTextContent(
            '데모 스토어입니다. 사업자 정보는 템플릿 config/business-info.json에서 설정할 수 있습니다.'
        );
        // footer still renders its normal rows
        expect(screen.getByTestId('store-footer')).toBeInTheDocument();
        expect(screen.getByTestId('footer-policy-privacy')).toBeInTheDocument();
    });

    it('CASE 4 (shipped config): footer renders seeded demo info and the demo notice', () => {
        render(
            <StoreFooter demoNotice="데모 스토어입니다. 사업자 정보는 템플릿 config/business-info.json에서 설정할 수 있습니다." />
        );
        // shipped business-info.json carries the user-approved demo seed
        expect(screen.getByTestId('footer-business-info')).toBeInTheDocument();
        expect(screen.getByTestId('footer-demo-notice')).toBeInTheDocument();
    });

    it('policy links are real anchors with template routes; 개인정보처리방침 matches the other sizes', () => {
        render(
            <StoreFooter
                termsLabel="이용약관"
                privacyLabel="개인정보처리방침"
                shippingLabel="배송·교환·반품 안내"
            />
        );
        const terms = screen.getByTestId('footer-policy-terms');
        const privacy = screen.getByTestId('footer-policy-privacy');
        const shipping = screen.getByTestId('footer-policy-shipping');
        expect(terms.closest('a')).toBe(terms);
        expect(privacy.getAttribute('href')).toBe('/shop/privacy');
        expect(shipping.getAttribute('href')).toBe('/shop/shipping-policy');
        expect(terms.getAttribute('href')).toBe('/shop/terms');
        expect(privacy.style.fontSize).toBe(terms.style.fontSize);
    });
});