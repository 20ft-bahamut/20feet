/**
 * Development-only SuperBify fixtures for design verification.
 *
 * These items are explicitly marked as `isFixture: true` and are intended to
 * preview the SuperBifyPreview layout when real public products are not yet
 * available. They must NOT be rendered in production as if they were real
 * SuperBify products, and version/price/download values are intentionally omitted.
 */

import type { SuperBifyItem } from '../types/template';

export const superbifyFixtures: SuperBifyItem[] = [
    {
        id: 'fixture-turnstile',
        slug: 'superbify-turnstile',
        title: 'SuperBify Turnstile',
        type: 'PLUGIN',
        summary: 'Gnuboard 7 Extension',
        compatibility: 'G7 >= 7.0.0',
        status: 'BUILDING',
        isFixture: true,
    },
    {
        id: 'fixture-business',
        slug: 'superbify-business',
        title: 'SuperBify Business',
        type: 'TEMPLATE',
        summary: 'Gnuboard 7 Template',
        compatibility: 'G7 >= 7.0.0',
        status: 'BUILDING',
        isFixture: true,
    },
    {
        id: 'fixture-developer-tools',
        slug: 'superbify-developer-tools',
        title: 'SuperBify Developer Tools',
        type: 'PLUGIN',
        summary: 'Developer Utility',
        compatibility: 'G7 >= 7.0.0',
        status: 'RESEARCH',
        isFixture: true,
    },
];
