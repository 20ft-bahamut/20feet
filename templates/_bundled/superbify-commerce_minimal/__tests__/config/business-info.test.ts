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

describe('config/business-info.json — no fake data guard', () => {
    const raw = JSON.parse(
        fs.readFileSync(path.join(TEMPLATE_ROOT, 'config/business-info.json'), 'utf8')
    ) as { shop: Record<string, string>; policies: Record<string, ReturnType<typeof getPolicyDocument>> };

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
        'hostingProvider',
        'businessVerificationUrl',
    ];

    it('business fields ship as empty strings in the repo default (no fake 000-00-00000 etc.)', () => {
        for (const key of REQUIRED_FIELDS) {
            expect(raw.shop, `field "${key}" must exist`).toHaveProperty(key);
            expect(raw.shop[key], `field "${key}" must ship empty`).toBe('');
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
    it('returns only non-empty fields from the shipped (empty) config', () => {
        expect(businessFields()).toEqual([]);
        expect(hasBusinessInfo()).toBe(false);
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