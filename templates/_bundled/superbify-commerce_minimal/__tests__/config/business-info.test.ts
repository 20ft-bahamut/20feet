import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import {
    businessInfo,
    businessFields,
    getPolicyDocument,
    hasBusinessInfo,
    localText,
} from '../../src/config/businessInfo';

const TEMPLATE_ROOT = path.resolve(__dirname, '../..');

describe('config/business-info.json — demo seed values', () => {
    const raw = JSON.parse(
        fs.readFileSync(path.join(TEMPLATE_ROOT, 'config/business-info.json'), 'utf8')
    ) as { shop: Record<string, string>; policies: Record<string, ReturnType<typeof getPolicyDocument>> };

    // Fields the footer actually renders. hostingProvider lives in the JSON
    // for forward compatibility (admin may add the input later) but is NOT
    // in REQUIRED_FIELDS — the footer does not project it onto the render
    // list because admin basic_info has no matching input. The JSON value
    // is therefore not asserted here.
    const REQUIRED_FIELDS = [
        'shopName',
        'companyName',
        'representative',
        'businessRegistrationNumber',
        'ecommerceRegistrationNumber',
        'ecommerceRegistrationAuthority',
        'businessAddress',
        'customerServicePhone',
        'customerServiceEmail',
        'businessVerificationUrl',
    ];

    // USER-APPROVED DEMO SEED: the store ships with clearly temporary demo business
    // values (a demo-store notice renders alongside them in the footer). Any
    // deviation from these literals must be a deliberate edit to business-info.json.
    const DEMO_SEED: Partial<Record<string, string>> = {
        businessRegistrationNumber: '12-345-67890',
        ecommerceRegistrationNumber: '2026-경남김해-1234호',
        businessAddress: '경남 김해시 장유로 362',
        customerServicePhone: '070-123-1234',
    };

    it('business fields exist; the shipped demo seed matches the approved literals', () => {
        for (const key of REQUIRED_FIELDS) {
            expect(raw.shop, `field "${key}" must exist`).toHaveProperty(key);
        }
        for (const [key, value] of Object.entries(DEMO_SEED)) {
            expect(raw.shop[key], `demo seed value of "${key}" must match`).toBe(value);
        }
        for (const key of REQUIRED_FIELDS) {
            if (!(key in DEMO_SEED)) {
                expect(raw.shop[key], `field "${key}" must stay empty until approved`).toBe('');
            }
        }
    });

    it('policy documents keep ko/en mirrors and are non-empty scaffolding', () => {
        for (const key of ['terms', 'privacy', 'shippingReturns'] as const) {
            const doc = raw.policies[key];
            expect(doc.title.ko.trim().length).toBeGreaterThan(0);
            expect(doc.title.en.trim().length).toBeGreaterThan(0);
            expect(Array.isArray(doc.sections) && doc.sections.length > 0).toBe(true);
            for (const section of doc.sections) {
                expect(section.heading.ko.trim().length).toBeGreaterThan(0);
                expect(section.heading.en.trim().length).toBeGreaterThan(0);
                for (const paragraph of section.paragraphs) {
                    expect(paragraph.ko.trim().length).toBeGreaterThan(0);
                    expect(paragraph.en.trim().length).toBeGreaterThan(0);
                }
            }
        }
        // every policy document closes with the honest "before launch" scaffolding section
        const noteHeadings = ['실제 운영 전 확인', 'Before launching a real store'];
        for (const key of ['terms', 'privacy', 'shipping'] as const) {
            const doc = getPolicyDocument(key);
            const headings = doc.sections.map((s) => [s.heading.ko, s.heading.en]);
            expect(headings.some(([ko, en]) => noteHeadings.includes(ko) || noteHeadings.includes(en))).toBe(true);
        }
    });
});

describe('businessFields()', () => {
    it('returns only the seeded demo fields from the shipped config (empty fields omitted)', () => {
        const fields = businessFields();
        expect(fields.map((f) => f.label_key).sort()).toEqual(
            [
                'superbify.business.field.business_registration_number',
                'superbify.business.field.ecommerce_registration_number',
                'superbify.business.field.business_address',
                'superbify.business.field.customer_service_phone',
            ].sort()
        );
        expect(hasBusinessInfo()).toBe(true);
        // hostingProvider is intentionally excluded from FIELD_DEFINITIONS —
        // admin basic_info has no matching input, so the footer never renders
        // it. The value may still live in config/business-info.json for forward
        // compatibility.
        expect(fields.find((f) => f.label_key === 'superbify.business.field.hosting_provider')).toBeUndefined();
    });

    it('keeps labels stable for future i18n bindings (label_key contract)', () => {
        // contract: the shape still exposes label_key/value (+ optional href/external)
        const fields = businessFields('ko');
        for (const field of fields) {
            expect(field.label_key).not.toBe('');
            expect(field.value).not.toBe('');
        }
    });

    it('exposes policy documents through a single accessor', () => {
        expect(getPolicyDocument('terms')).toBe(businessInfo.policies.terms);
        expect(getPolicyDocument('privacy')).toBe(businessInfo.policies.privacy);
        expect(getPolicyDocument('shipping')).toBe(businessInfo.policies.shippingReturns);
        expect(localText(businessInfo.policies.terms.title)).toBe('이용약관');
    });
});