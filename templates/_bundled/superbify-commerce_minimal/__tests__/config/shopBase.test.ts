import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { computeShopBase, getShopBase, SHOP_BASE_DEFAULT } from '../../src/config/shopBase';

describe('computeShopBase (pure)', () => {
    it('returns empty string when no_route=true', () => {
        expect(computeShopBase({ no_route: true })).toBe('');
        expect(computeShopBase({ no_route: true, route_path: 'store' })).toBe('');
    });

    it('returns /shop when route_path is missing', () => {
        expect(computeShopBase({ no_route: false })).toBe('/shop');
        expect(computeShopBase({})).toBe('/shop');
    });

    it('returns /{route_path} when route_path is set', () => {
        expect(computeShopBase({ no_route: false, route_path: 'store' })).toBe('/store');
        expect(computeShopBase({ no_route: false, route_path: 'mall' })).toBe('/mall');
    });

    it('falls back to /shop when route_path is empty string', () => {
        expect(computeShopBase({ no_route: false, route_path: '' })).toBe('/shop');
    });

    it('handles null/undefined input', () => {
        expect(computeShopBase(null)).toBe(SHOP_BASE_DEFAULT);
        expect(computeShopBase(undefined)).toBe(SHOP_BASE_DEFAULT);
    });
});

describe('getShopBase (browser-aware)', () => {
    const ORIGINAL_G7 = (globalThis as any).window;

    beforeEach(() => {
        // Reset window.G7Core between tests so module-level reads are isolated.
        delete (globalThis as any).window;
        (globalThis as any).window = {};
    });

    afterEach(() => {
        (globalThis as any).window = ORIGINAL_G7 ?? {};
    });

    it('returns the state-injected shopBase when G7Core.state has it', () => {
        (globalThis as any).window = {
            G7Core: {
                state: {
                    get: () => ({ shopBase: '/shop' }),
                },
            },
        };
        expect(getShopBase()).toBe('/shop');
    });

    it('falls through to module basic_info when state lacks shopBase', () => {
        (globalThis as any).window = {
            G7Core: {
                state: {
                    get: () => ({
                        modules: {
                            'sirsoft-ecommerce': {
                                basic_info: { no_route: false, route_path: 'store' },
                            },
                        },
                    }),
                },
            },
        };
        expect(getShopBase()).toBe('/store');
    });

    it('falls back to /shop when neither state nor module is set', () => {
        (globalThis as any).window = { G7Core: undefined };
        expect(getShopBase()).toBe('/shop');
    });

    it('returns empty string when no_route=true is set', () => {
        (globalThis as any).window = {
            G7Core: {
                state: {
                    get: () => ({
                        modules: {
                            'sirsoft-ecommerce': { basic_info: { no_route: true } },
                        },
                    }),
                },
            },
        };
        expect(getShopBase()).toBe('');
    });

    it('ignores placeholder raw template expression output from state', () => {
        // Engine may briefly expose the raw binding string during initial
        // evaluation. The resolver must not hand that out as a literal URL.
        (globalThis as any).window = {
            G7Core: {
                state: {
                    get: () => ({
                        shopBase: '{{_global.modules?.[...]?.basic_info?.route_path ?? \'shop\'}}',
                    }),
                },
            },
        };
        // Falls through to module info (none here) → /shop.
        expect(getShopBase()).toBe('/shop');
    });
});
