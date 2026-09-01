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

function collectCompositeNames(node: any): string[] {
    if (!node || typeof node !== 'object') return [];
    const out: string[] = [];
    if (typeof node.name === 'string') out.push(node.name);
    if (Array.isArray(node)) {
        for (const child of node) out.push(...collectCompositeNames(child));
    }
    if (Array.isArray(node.children)) {
        for (const child of node.children) out.push(...collectCompositeNames(child));
    }
    if (Array.isArray(node.slots)) {
        for (const slot of node.slots) {
            if (slot.content) out.push(...collectCompositeNames({ children: slot.content }));
        }
    }
    return out;
}

function findNodeByName(node: any, name: string): any | null {
    if (!node || typeof node !== 'object') return null;
    if (node.name === name) return node;
    if (Array.isArray(node)) {
        for (const child of node) {
            const hit = findNodeByName(child, name);
            if (hit) return hit;
        }
        return null;
    }
    for (const child of node.children ?? []) {
        const hit = findNodeByName(child, name);
        if (hit) return hit;
    }
    if (Array.isArray(node.slots)) {
        for (const slot of node.slots) {
            const hit = findNodeByName({ children: slot.content }, name);
            if (hit) return hit;
        }
    }
    return null;
}

describe('layout JSONs', () => {
    it('home.json wires the required data sources', () => {
        const home = JSON.parse(fs.readFileSync(path.join(TEMPLATE_ROOT, 'layouts/home.json'), 'utf8'));
        const ids = (home.data_sources as Array<{ id: string }>).map((d) => d.id);
        expect(ids).toEqual(expect.arrayContaining(['new_arrivals', 'popular_products', 'featured_categories']));
    });

    it('home.json renders hero, category, new arrivals, popular, story, editorial, and final CTA sections', () => {
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
            ])
        );
        // Final CTA block has no composite (it's inline primitives); confirm
        // the eyebrow / heading / cta i18n keys plus the shopBase-bound href are wired.
        const finalCta = home.slots?.content?.find((s: any) => s?.id === 'home_final_cta');
        expect(finalCta).toBeTruthy();
        const textBlob = JSON.stringify(finalCta);
        expect(textBlob).toContain('$t:superbify.home.final_cta.eyebrow');
        expect(textBlob).toContain('$t:superbify.home.final_cta.heading');
        expect(textBlob).toContain('$t:superbify.home.final_cta.cta');
        expect(textBlob).toContain("_global.shopBase ?? '/shop'}}/");
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

    it('shop/product.json binds route.product_code into detail endpoint', () => {
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

    it('shop/product.json includes PurchasePanel + scmBindAddToCartListener init', () => {
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
        // Phase 1 parity: AddToCartPanel composite was replaced by PurchasePanel
        // (phase1-spec.md). AddToCartPanel still exists in the registry for fallback
        // reuse, but product.json mounts PurchasePanel for option/additional-option
        // parity.
        expect(names).toContain('PurchasePanel');
        expect(names).toContain('WishlistHeart');
        expect(names).toContain('ProductReviews');
        expect(names).toContain('ProductQna');
        expect(names).toContain('CouponDownloadBadges');
        const init = (prod.init_actions as Array<{ handler: string }>) ?? [];
        expect(init.map((a) => a.handler)).toContain('scmBindAddToCartListener');
    });

    it('shop/product.json ships admin edit affordance + downloadable-coupons DS + shipping policy KV', () => {
        const prod = JSON.parse(
            fs.readFileSync(path.join(TEMPLATE_ROOT, 'layouts/shop/product.json'), 'utf8')
        );
        const ids = (prod.data_sources as Array<{ id: string; endpoint: string }>).map((d) => d.id);
        const coupons = (prod.data_sources as Array<{ id: string; endpoint: string }>).find(
            (d) => d.id === 'productDownloadableCoupons',
        );
        expect(ids).toContain('productDownloadableCoupons');
        expect(coupons?.endpoint).toBe(
            '/api/modules/sirsoft-ecommerce/products/{{route.slug}}/downloadable-coupons',
        );
        // Admin edit link — target="_blank", gated by abilities.can_update, links to
        // /admin/ecommerce/products/{product_code}/edit. Layout engine binds the
        // single :slug route param as route.slug (no route.product_code exists).
        const textBlob = JSON.stringify(prod.slots);
        expect(textBlob).toContain('/admin/ecommerce/products/{{product_detail?.data?.product_code ?? route.slug}}/edit');
        expect(textBlob).toContain('"target":"_blank"');
        expect(textBlob).toContain('product_detail?.data?.abilities?.can_update');
        // Shipping policy KV rows — fee_summary + free_threshold_formatted.
        expect(textBlob).toContain('shipping_policy?.fee_summary');
        expect(textBlob).toContain('shipping_policy?.free_threshold_formatted');
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

    it('routes.json declares /shop/checkout, /shop/cart (canonical) + /cart (legacy redirect), /shop/guest/orders, /shop/guest/orders/:order_number, /shop/reorder/:id, and drops the legacy /shop/order/complete', () => {
        const routes = JSON.parse(
            fs.readFileSync(path.join(TEMPLATE_ROOT, 'routes.json'), 'utf8')
        );
        const paths = (routes.routes as Array<{ path: string; layout: string }>).map((r) => r.path);
        expect(paths).toContain('/shop/cart');
        expect(paths).toContain('/cart'); // legacy compatibility redirect
        expect(paths).toContain('/shop/checkout');
        expect(paths).not.toContain('/shop/order/complete'); // legacy blank route removed
        expect(paths).toContain('/shop/guest/orders');
        expect(paths).toContain('/shop/guest/orders/:order_number');
        expect(paths).toContain('/shop/reorder/:id'); // canonical under shop prefix
    });

    it('routes.json marks /login, /register, /forgot-password, /reset-password as guest_only', () => {
        const routes = JSON.parse(
            fs.readFileSync(path.join(TEMPLATE_ROOT, 'routes.json'), 'utf8')
        );
        const guestOnlyPaths = ['/login', '/register', '/forgot-password', '/reset-password'];
        for (const p of guestOnlyPaths) {
            const route = (routes.routes as Array<{ path: string; guest_only?: boolean }>).find((r) => r.path === p);
            expect(route, `route ${p} missing`).toBeTruthy();
            expect(route?.guest_only, `route ${p} must be guest_only`).toBe(true);
        }
    });

    it('_user_base.json seeds _global.shopBase from module basic_info', () => {
        const base = JSON.parse(
            fs.readFileSync(path.join(TEMPLATE_ROOT, 'layouts/_user_base.json'), 'utf8')
        );
        const init = (base.init_actions as Array<{ handler: string; params?: Record<string, unknown> }>) ?? [];
        const seed = init.find((a) => a.handler === 'setState' && a.params?.shopBase);
        expect(seed).toBeTruthy();
        const expr = seed?.params?.shopBase as string;
        expect(expr).toContain("basic_info?.no_route");
        expect(expr).toContain("basic_info?.route_path");
    });

    it('notice-detail back/prev/next links use _global.shopBase interpolation', () => {
        const detail = JSON.parse(
            fs.readFileSync(path.join(TEMPLATE_ROOT, 'layouts/shop/notice-detail.json'), 'utf8')
        );
        const textBlob = JSON.stringify(detail.slots);
        expect(textBlob).toContain("_global.shopBase ?? '/shop'");
    });

    it('home.json final CTA href uses _global.shopBase interpolation', () => {
        const home = JSON.parse(fs.readFileSync(path.join(TEMPLATE_ROOT, 'layouts/home.json'), 'utf8'));
        const finalCta = home.slots?.content?.find((s: any) => s?.id === 'home_final_cta');
        const textBlob = JSON.stringify(finalCta);
        expect(textBlob).toContain("_global.shopBase ?? '/shop'");
    });

    it('shop/notice.json wires page query param, row links, and pagination navigation', () => {
        const notice = JSON.parse(
            fs.readFileSync(path.join(TEMPLATE_ROOT, 'layouts/shop/notice.json'), 'utf8')
        );
        // list data source forwards the page query param
        const list = (notice.data_sources as Array<{
            id: string;
            endpoint: string;
            params: Record<string, string>;
        }>).find((d) => d.id === 'notice_posts');
        expect(list?.endpoint).toBe('/api/modules/sirsoft-board/boards/store-notice/posts');
        expect(list?.params?.page).toBe('{{query.page ?? 1}}');
        expect(list?.params?.per_page).toBe('{{query.per_page ?? 10}}');

        const names = collectCompositeNames({ children: notice.slots?.content });
        expect(names).toEqual(expect.arrayContaining(['NoticeList', 'Pagination']));

        const pagination = findNodeByName(notice.slots?.content, 'Pagination');
        expect(pagination.props.totalPages).toContain('pagination?.last_page');
        const navAction = (pagination.actions as Array<{
            event: string;
            handler: string;
            params: { path: string; mergeQuery: boolean; query: Record<string, string> };
        }>).find((a) => a.event === 'onPageChange');
        expect(navAction?.handler).toBe('navigate');
        expect(navAction?.params.mergeQuery).toBe(true);
        expect(navAction?.params.query?.page).toBe('{{$args[0]}}');
    });

    it('shop/notice-detail.json binds post + navigation sources on route.id and renders via HtmlContent', () => {
        const detail = JSON.parse(
            fs.readFileSync(path.join(TEMPLATE_ROOT, 'layouts/shop/notice-detail.json'), 'utf8')
        );
        const post = (detail.data_sources as Array<{ id: string; endpoint: string }>).find(
            (d) => d.id === 'notice_post'
        );
        const navigation = (detail.data_sources as Array<{ id: string; endpoint: string }>).find(
            (d) => d.id === 'notice_navigation'
        );
        expect(post?.endpoint).toBe(
            '/api/modules/sirsoft-board/boards/store-notice/posts/{{route.id}}'
        );
        expect(navigation?.endpoint).toBe(
            '/api/modules/sirsoft-board/boards/store-notice/posts/{{route.id}}/navigation'
        );

        const names = collectCompositeNames({ children: detail.slots?.content });
        expect(names).toContain('HtmlContent');

        const textBlob = JSON.stringify(detail.slots);
        // back link + meta labels are bound via i18n keys
        expect(textBlob).toContain('$t:superbify.notice.back_to_list');
        expect(textBlob).toContain('$t:superbify.notice.view_count');
        expect(textBlob).toContain("_global.shopBase ?? '/shop'}}/notice");
        // content html rendering goes through the sanitized composite, not raw layout text
        const content = findNodeByName(detail.slots?.content, 'HtmlContent');
        expect(content?.props?.content).toContain('notice_post?.data?.content');
        expect(content?.props?.isHtml).toContain("content_mode ?? 'text') === 'html'");
    });

    it('routes.json declares /shop/notice and /shop/notice/:id', () => {
        const routes = JSON.parse(
            fs.readFileSync(path.join(TEMPLATE_ROOT, 'routes.json'), 'utf8')
        );
        const pairs = routes.routes as Array<{ path: string; layout: string }>;
        expect(pairs.find((r) => r.path === '/shop/notice/:id')?.layout).toBe('shop/notice-detail');
        expect(pairs.find((r) => r.path === '/shop/notice')?.layout).toBe('shop/notice');
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
