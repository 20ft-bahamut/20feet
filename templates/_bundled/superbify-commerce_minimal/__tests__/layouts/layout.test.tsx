import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const TEMPLATE_ROOT = path.resolve(__dirname, '../..');
const SRC_INDEX = path.join(TEMPLATE_ROOT, 'src/index.ts');

function listLayoutJsonFiles(): string[] {
    const layoutsDir = path.join(TEMPLATE_ROOT, 'layouts');
    const result: string[] = [];
    const walk = (dir: string) => {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const full = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                walk(full);
            } else if (entry.isFile() && entry.name.endsWith('.json')) {
                result.push(full);
            }
        }
    };
    walk(layoutsDir);
    return result;
}

describe('layout JSONs', () => {
    it('home.json wires the required data sources', () => {
        const home = JSON.parse(fs.readFileSync(path.join(TEMPLATE_ROOT, 'layouts/home.json'), 'utf8'));
        const ids = (home.data_sources as Array<{ id: string }>).map((d) => d.id);
        expect(ids).toEqual(expect.arrayContaining(['new_arrivals', 'popular_products', 'featured_categories']));
    });

    it('home.json renders hero, category, new arrivals, popular, story, and promo sections', () => {
        const home = JSON.parse(fs.readFileSync(path.join(TEMPLATE_ROOT, 'layouts/home.json'), 'utf8'));

        // Walk the layout tree to collect all composite component names.
        const collectNames = (node: any): string[] => {
            if (!node || typeof node !== 'object') return [];
            const out: string[] = [];
            if (typeof node.name === 'string') out.push(node.name);
            if (Array.isArray(node.children)) {
                for (const child of node.children) out.push(...collectNames(child));
            }
            if (Array.isArray(node.slots)) {
                for (const slot of node.slots) {
                    if (slot.content) out.push(...collectNames({ children: slot.content }));
                }
            }
            return out;
        };
        const names = collectNames({ children: home.slots?.content });
        expect(names).toEqual(
            expect.arrayContaining([
                'HeroBanner',
                'CategoryPreviewStrip',
                'ProductGrid',
                'BrandStorySection',
                'EditorialBanner',
                'PromoBanner',
            ])
        );
    });

    it('shop/index.json uses products and categories data sources', () => {
        const idx = JSON.parse(
            fs.readFileSync(path.join(TEMPLATE_ROOT, 'layouts/shop/index.json'), 'utf8')
        );
        const ids = (idx.data_sources as Array<{ id: string }>).map((d) => d.id);
        expect(ids).toEqual(expect.arrayContaining(['products', 'categories']));
    });

    it('shop/category.json binds route.slug into endpoint and query', () => {
        const cat = JSON.parse(
            fs.readFileSync(path.join(TEMPLATE_ROOT, 'layouts/shop/category.json'), 'utf8')
        );
        const detail = (cat.data_sources as Array<{ id: string; endpoint: string }>).find(
            (d) => d.id === 'category_detail'
        );
        const list = (cat.data_sources as Array<{ id: string; params: Record<string, string> }>).find(
            (d) => d.id === 'category_products'
        );
        expect(detail?.endpoint).toBe('/api/modules/sirsoft-ecommerce/categories/{{route.slug}}');
        expect(list?.params?.category_slug).toBe('{{route.slug}}');
    });

    it('shop/product.json binds route.slug into detail endpoint', () => {
        const prod = JSON.parse(
            fs.readFileSync(path.join(TEMPLATE_ROOT, 'layouts/shop/product.json'), 'utf8')
        );
        const detail = (prod.data_sources as Array<{ id: string; endpoint: string }>).find(
            (d) => d.id === 'product_detail'
        );
        expect(detail?.endpoint).toBe('/api/modules/sirsoft-ecommerce/products/{{route.slug}}');
    });

    it('cart.json uses cart endpoint and X-Cart-Key via globalHeaders', () => {
        const cart = JSON.parse(fs.readFileSync(path.join(TEMPLATE_ROOT, 'layouts/cart.json'), 'utf8'));
        const ds = (cart.data_sources as Array<{ id: string; endpoint: string }>).find(
            (d) => d.id === 'cart'
        );
        expect(ds?.endpoint).toBe('/api/modules/sirsoft-ecommerce/cart');
        const base = JSON.parse(
            fs.readFileSync(path.join(TEMPLATE_ROOT, 'layouts/_user_base.json'), 'utf8')
        );
        const gh = base.globalHeaders as Array<{ pattern: string; headers: Record<string, string> }>;
        const matched = gh.find((g) => g.pattern === '/api/modules/sirsoft-ecommerce/*');
        expect(matched?.headers?.['X-Cart-Key']).toBe('{{_global.cartKey}}');
    });

    it('cart.json renders CartItemRow + CartSummary + binds cart-page listener', () => {
        const cart = JSON.parse(fs.readFileSync(path.join(TEMPLATE_ROOT, 'layouts/cart.json'), 'utf8'));
        const collectNames = (node: any): string[] => {
            if (!node || typeof node !== 'object') return [];
            const out: string[] = [];
            if (typeof node.name === 'string') out.push(node.name);
            if (Array.isArray(node.children)) {
                for (const child of node.children) out.push(...collectNames(child));
            }
            return out;
        };
        const names = collectNames({ children: cart.slots?.content });
        expect(names).toEqual(expect.arrayContaining(['CartItemRow', 'CartSummary']));
        const init = (cart.init_actions as Array<{ handler: string }>) ?? [];
        expect(init.map((a) => a.handler)).toContain('scmBindCartPageListeners');
    });

    it('shop/product.json includes AddToCartPanel + scmBindAddToCartListener init', () => {
        const prod = JSON.parse(
            fs.readFileSync(path.join(TEMPLATE_ROOT, 'layouts/shop/product.json'), 'utf8')
        );
        const collectNames = (node: any): string[] => {
            if (!node || typeof node !== 'object') return [];
            const out: string[] = [];
            if (typeof node.name === 'string') out.push(node.name);
            if (Array.isArray(node.children)) {
                for (const child of node.children) out.push(...collectNames(child));
            }
            return out;
        };
        const names = collectNames({ children: prod.slots?.content });
        expect(names).toContain('AddToCartPanel');
        const init = (prod.init_actions as Array<{ handler: string }>) ?? [];
        expect(init.map((a) => a.handler)).toContain('scmBindAddToCartListener');
    });

    it('shop/checkout.json renders CheckoutPage composite with checkoutData + payment + shipping data sources', () => {
        const co = JSON.parse(
            fs.readFileSync(path.join(TEMPLATE_ROOT, 'layouts/shop/checkout.json'), 'utf8')
        );
        const collectNames = (node: any): string[] => {
            if (!node || typeof node !== 'object') return [];
            const out: string[] = [];
            if (typeof node.name === 'string') out.push(node.name);
            if (Array.isArray(node.children)) {
                for (const child of node.children) out.push(...collectNames(child));
            }
            return out;
        };
        const names = collectNames({ children: co.slots?.content });
        expect(names).toContain('CheckoutPage');
        const ids = (co.data_sources as Array<{ id: string; endpoint: string }>).map((d) => d.id);
        expect(ids).toContain('checkoutData');
        expect(ids).toContain('paymentSettings');
        expect(ids).toContain('shippingSettings');
        const checkoutDs = (co.data_sources as Array<{ id: string; endpoint: string }>).find(
            (d) => d.id === 'checkoutData'
        );
        expect(checkoutDs?.endpoint).toBe('/api/modules/sirsoft-ecommerce/checkout');
    });

    it('shop/order_complete.json binds order data source with optional X-Guest-Order-Token header', () => {
        const oc = JSON.parse(
            fs.readFileSync(path.join(TEMPLATE_ROOT, 'layouts/shop/order_complete.json'), 'utf8')
        );
        const ds = (oc.data_sources as Array<{ id: string; endpoint: string; headers?: Record<string, string> }>).find(
            (d) => d.id === 'scmOrder'
        );
        expect(ds?.endpoint).toBe('/api/modules/sirsoft-ecommerce/user/orders/{{route.order_number}}');
        expect(ds?.headers?.['X-Guest-Order-Token']).toBe('{{_global.guestOrderToken}}');
    });

    it('shop/guest_order_form.json posts verify to /guest/orders/verify', () => {
        const gf = JSON.parse(
            fs.readFileSync(path.join(TEMPLATE_ROOT, 'layouts/shop/guest_order_form.json'), 'utf8')
        );
        const text = fs.readFileSync(path.join(TEMPLATE_ROOT, 'layouts/shop/guest_order_form.json'), 'utf8');
        expect(text).toContain('/api/modules/sirsoft-ecommerce/guest/orders/verify');
        expect(text).toContain('guest_lookup_password');
        expect(gf.initLocal?.form?.order_number).toBeDefined();
    });

    it('shop/guest_order_show.json uses OrderCompletePage composite with guest token header', () => {
        const gs = JSON.parse(
            fs.readFileSync(path.join(TEMPLATE_ROOT, 'layouts/shop/guest_order_show.json'), 'utf8')
        );
        const collectNames = (node: any): string[] => {
            if (!node || typeof node !== 'object') return [];
            const out: string[] = [];
            if (typeof node.name === 'string') out.push(node.name);
            if (Array.isArray(node.children)) {
                for (const child of node.children) out.push(...collectNames(child));
            }
            return out;
        };
        const names = collectNames({ children: gs.slots?.content });
        expect(names).toContain('OrderCompletePage');
        const ds = (gs.data_sources as Array<{ id: string; endpoint: string; headers?: Record<string, string> }>).find(
            (d) => d.id === 'scmGuestOrder'
        );
        expect(ds?.endpoint).toBe('/api/modules/sirsoft-ecommerce/user/orders/{{route.order_number}}');
        expect(ds?.headers?.['X-Guest-Order-Token']).toBe('{{_global.guestOrderToken}}');
    });

    it('routes.json declares /shop/checkout, /shop/order/complete, /shop/guest/orders, /shop/guest/orders/:order_number', () => {
        const routes = JSON.parse(
            fs.readFileSync(path.join(TEMPLATE_ROOT, 'routes.json'), 'utf8')
        );
        const paths = (routes.routes as Array<{ path: string; layout: string }>).map((r) => r.path);
        expect(paths).toContain('/cart');
        expect(paths).toContain('/shop/checkout');
        expect(paths).toContain('/shop/order/complete');
        expect(paths).toContain('/shop/guest/orders');
        expect(paths).toContain('/shop/guest/orders/:order_number');
    });
});

describe('guard: fixtures never imported from src/index.ts', () => {
    it('does not import from src/components/fixtures in src/index.ts', () => {
        const src = fs.readFileSync(SRC_INDEX, 'utf8');
        expect(src.includes('components/fixtures')).toBe(false);
    });
});

describe('guard: no external http(s) URLs in any layout JSON', () => {
    it('layout JSONs only use relative paths or /api endpoints', () => {
        const files = listLayoutJsonFiles();
        const offenders: string[] = [];
        const urlPattern = /https?:\/\//i;
        for (const file of files) {
            const content = fs.readFileSync(file, 'utf8');
            if (urlPattern.test(content)) {
                offenders.push(file);
            }
        }
        expect(offenders, `Offending files:\n${offenders.join('\n')}`).toEqual([]);
    });
});
