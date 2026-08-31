import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const TEMPLATE_ROOT = path.resolve(__dirname, '../..');
const LAYOUTS_DIR = path.join(TEMPLATE_ROOT, 'layouts');

type Json = { [key: string]: any };

function loadJson(relPath: string): Json {
    return JSON.parse(fs.readFileSync(path.join(TEMPLATE_ROOT, relPath), 'utf-8')) as Json;
}

/** Recursively find all nodes with the given node `name` (or top-level single root). */
function findNodesByName(node: any, name: string, out: any[] = []): any[] {
    if (!node || typeof node !== 'object') return out;
    if (node.name === name) out.push(node);
    if (Array.isArray(node)) {
        for (const child of node) findNodesByName(child, name, out);
        return out;
    }
    for (const child of node.children ?? []) findNodesByName(child, name, out);
    for (const slot of node.slots ?? []) findNodesByName(slot.content, name, out);
    return out;
}

function findNodeByName(node: any, name: string): any | null {
    const hits = findNodesByName(node, name);
    return hits.length ? hits[0] : null;
}

const ROUTES = loadJson('routes.json').routes as Json[];
const routeByLayout = new Map<string, Json>();
for (const r of ROUTES) {
    const layout = r.layout;
    if (typeof layout === 'string') routeByLayout.set(layout, r);
}

const AUTH_LAYOUTS = [
    'auth/login',
    'auth/register',
    'auth/forgot_password',
    'auth/reset_password',
];
const MYPAGE_LAYOUTS = [
    'mypage/orders',
    'mypage/order_show',
    'mypage/addresses',
    'mypage/profile',
    'mypage/profile_edit',
    'mypage/change_password',
    'mypage/wishlist',
    'mypage/coupons',
    'mypage/mileage',
    'mypage/inquiries',
];

describe('member auth/mypage layout bindings (v0.2.0)', () => {
    it('every auth layout maps to a routes.json entry, extends _user_base, and has non-empty content', () => {
        expect(AUTH_LAYOUTS.length).toBe(4);
        for (const layoutName of AUTH_LAYOUTS) {
            const file = path.join(LAYOUTS_DIR, ...layoutName.split('/')) + '.json';
            expect(fs.existsSync(file), `${layoutName} layout file exists`).toBe(true);
            const json = loadJson(path.relative(TEMPLATE_ROOT, file));
            const route = routeByLayout.get(layoutName);
            expect(route, `${layoutName} declared in routes.json`).toBeTruthy();
            expect(json.layout_name).toBe(layoutName);
            expect(json.extends).toBe('_user_base');
            const content = json.slots?.content;
            expect(Array.isArray(content), `${layoutName} slots.content is a non-empty array`).toBe(true);
            expect(content.length).toBeGreaterThan(0);
            expect(json.meta?.title).toBe(route!.meta?.title);
        }
    });

    it('every mypage layout maps to a routes.json entry, extends _user_base, and has non-empty content', () => {
        expect(MYPAGE_LAYOUTS.length).toBe(10);
        for (const layoutName of MYPAGE_LAYOUTS) {
            const file = path.join(LAYOUTS_DIR, ...layoutName.split('/')) + '.json';
            expect(fs.existsSync(file), `${layoutName} layout file exists`).toBe(true);
            const json = loadJson(path.relative(TEMPLATE_ROOT, file));
            const route = routeByLayout.get(layoutName);
            expect(route, `${layoutName} declared in routes.json`).toBeTruthy();
            expect(route!.path, `${layoutName} route is auth_required`).toMatch(/^\/mypage/);
            expect(route!.auth_required).toBe(true);
            expect(json.layout_name).toBe(layoutName);
            expect(json.extends).toBe('_user_base');
            const content = json.slots?.content;
            expect(Array.isArray(content), `${layoutName} slots.content is a non-empty array`).toBe(true);
            expect(content.length).toBeGreaterThan(0);
        }
    });

    it('/mypage route itself is auth_required (redirect handled at route level)', () => {
        const route = ROUTES.find((r) => r.path === '/mypage');
        expect(route).toBeTruthy();
        expect(route!.auth_required).toBe(true);
    });

    it('_auth_login_form posts handler login target user, refetches cart_count, navigates to query.redirect', () => {
        const form = loadJson('layouts/partials/auth/_login_form.json');
        const submitAction = (form.actions ?? []).find((a: any) => a.type === 'submit');
        expect(submitAction, 'form has a submit action').toBeTruthy();
        expect(submitAction.handler).toBe('sequence');

        const loginAction = submitAction.actions.find((a: any) => a.handler === 'login');
        expect(loginAction, 'sequence contains handler login').toBeTruthy();
        expect(loginAction.target).toBe('user');
        expect(loginAction.params.body).toEqual({
            email: '{{form.email}}',
            password: '{{form.password}}',
        });

        const onSuccess = loginAction.onSuccess as any[];
        const refetch = onSuccess.find((a) => a.handler === 'refetchDataSource');
        expect(refetch, 'onSuccess refetches cart_count after cart merge').toBeTruthy();
        expect(refetch.params.dataSourceId).toBe('cart_count');

        const navigate = onSuccess.find((a) => a.handler === 'navigate');
        expect(navigate, 'onSuccess navigates with query.redirect fallback').toBeTruthy();
        expect(navigate.params.path).toBe("{{query.redirect ?? '/'}}");

        const setCurrentUser = onSuccess.find(
            (a) => a.handler === 'setState' && a.params.target === 'global' && 'currentUser' in a.params,
        );
        expect(setCurrentUser, 'onSuccess sets _global.currentUser').toBeTruthy();
    });

    it('_user_base.json attaches X-Cart-Key to /api/auth/* and defines 401-suppressed current_user DS', () => {
        const base = loadJson('layouts/_user_base.json');
        const authHeader = (base.globalHeaders ?? []).find(
            (h: any) => h.pattern === '/api/auth/*',
        );
        expect(authHeader, '/api/auth/* globalheader exists').toBeTruthy();
        expect(authHeader.headers).toMatchObject({ 'X-Cart-Key': '{{_global.cartKey}}' });

        const ecommerceHeader = (base.globalHeaders ?? []).find(
            (h: any) => h.pattern === '/api/modules/sirsoft-ecommerce/*',
        );
        expect(ecommerceHeader, 'ecommerce cart header kept').toBeTruthy();

        const currentUser = (base.data_sources ?? []).find((ds: any) => ds.id === 'current_user');
        expect(currentUser, 'current_user DS exists').toBeTruthy();
        expect(currentUser.endpoint).toBe('/api/auth/user');
        expect(currentUser.auth_required).toBe(true);
        expect(currentUser.initGlobal).toBe('currentUser');
        expect(currentUser.errorHandling?.['401']?.handler).toBe('suppress');

        const cartCount = (base.data_sources ?? []).find((ds: any) => ds.id === 'cart_count');
        expect(cartCount).toBeTruthy();
        expect(cartCount.initGlobal).toMatchObject({ key: 'cartCount' });
    });

    it('checkout.json binds isLoggedIn to _global.currentUser and nests the daum extension slot inside the composite', () => {
        const checkout = loadJson('layouts/shop/checkout.json');
        expect(checkout.extends).toBe('_user_base');
        const json = JSON.stringify(checkout);
        expect(json).toContain('"isLoggedIn":"{{_global?.currentUser?.uuid ? true : false}}"');

        const content = checkout.slots?.content as any[];
        // CHECKOUT FINAL REDESIGN — the extension_point moved INSIDE the
        // CheckoutPage composite children so the plugin button renders in the
        // 우편번호 field row (a sibling rendered it floating above the form).
        const composite = content.find((n: any) => n.type === 'composite');
        expect(composite, 'CheckoutPage composite exists in content').toBeTruthy();
        const extensionNode = (composite.children as any[]).find(
            (n: any) => n.type === 'extension_point' && n.name === 'address_search_slot',
        );
        expect(extensionNode, 'address_search_slot extension_point is a composite child').toBeTruthy();
        expect(extensionNode.id).toBe('checkout_address_search_slot');
        expect(content.some((n: any) => n.type === 'extension_point')).toBe(false);

        // The callback writes _global.checkoutAddress for the CheckoutForm state bridge.
        const callbackJson = JSON.stringify(extensionNode.callbacks ?? {});
        expect(callbackJson).toContain('"checkoutAddress"');
        expect(callbackJson).toContain('"zipcode":"{{$event.zipcode}}"');
        expect(callbackJson).toContain('"address":"{{$event.address}}"');

        // readOnlyFields keeps the named inputs (zipcode/address) in readOnly mode after search.
        expect(extensionNode.props?.readOnlyFields).toEqual(['zipcode', 'address']);
    });

    it('mypage/orders DS is auth_required, paginated, and cancel posts /user/orders/{id}/cancel with reason', () => {
        const orders = loadJson('layouts/mypage/orders.json');
        const ordersDs = (orders.data_sources ?? []).find((ds: any) => ds.id === 'orders');
        expect(ordersDs, 'orders DS exists').toBeTruthy();
        expect(ordersDs.endpoint).toBe('/api/modules/sirsoft-ecommerce/user/orders');
        expect(ordersDs.auth_required).toBe(true);
        expect(ordersDs.params?.page).toBe('{{_local.ordersPage ?? 1}}');
        expect(ordersDs.params?.per_page).toBe('10');

        // pagination binding: _list partial must render the Pagination composite wired to ordersPage
        const listJson = loadJson('layouts/partials/mypage/orders/_list.json');
        const paginations = findNodesByName(listJson, 'Pagination');
        expect(paginations.length).toBeGreaterThan(0);
        expect(JSON.stringify(paginations[0])).toContain('ordersPage');

        // cancel action: numeric order id + reason body only
        const cancelJson = loadJson('layouts/partials/mypage/orders/_modal_cancel.json');
        const flat = JSON.stringify(cancelJson);
        expect(flat).toContain(
            "/api/modules/sirsoft-ecommerce/user/orders/{{order.data.id ?? ''}}/cancel",
        );
        expect(flat).toContain('"reason"');
        expect(cancelJson.meta?.api_note ?? '').toContain('numeric id');
    });

    it('auth layouts contain a redirect_if_logged_in partial reference and register form posts /api/auth/register', () => {
        const registerPage = loadJson('layouts/auth/register.json');
        const registerPageJson = JSON.stringify(registerPage);
        expect(registerPageJson).toContain('partials/auth/_redirect_if_logged_in.json');
        expect(registerPageJson).toContain('partials/auth/_register_form.json');

        const registerForm = loadJson('layouts/partials/auth/_register_form.json');
        const submitAction = (registerForm.actions ?? []).find((a: any) => a.type === 'submit');
        expect(submitAction).toBeTruthy();
        const registerAction = JSON.stringify(submitAction);
        expect(registerAction).toContain('/api/auth/register');
        expect(registerAction).toContain('navigate');
    });

    it('logout is wired in StoreHeader props and clears auth via the layout handler set', () => {
        // StoreHeader receives the logged-in user name; logout is a header action.
        const base = loadJson('layouts/_user_base.json');
        const header = findNodeByName(base.components?.[0], 'StoreHeader');
        expect(header).toBeTruthy();
        expect(header.props.user).toContain('_global.currentUser');
        expect(header.props.logoutLabel).toBe('$t:superbify.auth.logout');
        expect(header.props.mypageLabel).toBe('$t:superbify.mypage.title');
    });
});

describe('$t:superbify.* lang completeness (ko/en, zero missing)', () => {
    it('every $t reference in layouts/** and routes.json resolves in ko.json and en.json', () => {
        const refs = new Set<string>();
        const collect = (node: any) => {
            if (Array.isArray(node)) {
                for (const child of node) collect(child);
                return;
            }
            if (node && typeof node === 'object') {
                for (const value of Object.values(node)) collect(value);
                return;
            }
            if (typeof node === 'string') {
                for (const m of node.matchAll(/\$t:([A-Za-z0-9_.\-]+)/g)) refs.add(m[1]);
            }
        };
        collect(loadJson('routes.json'));
        const walkFiles = (dir: string) => {
            for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
                const full = path.join(dir, entry.name);
                if (entry.isDirectory()) walkFiles(full);
                else if (entry.name.endsWith('.json')) collect(JSON.parse(fs.readFileSync(full, 'utf-8')));
            }
        };
        walkFiles(LAYOUTS_DIR);

        expect(refs.size).toBeGreaterThan(200);

        const resolve = (dotted: string, table: Json): boolean => {
            let cur: any = table;
            for (const part of dotted.split('.')) {
                if (!cur || typeof cur !== 'object' || !(part in cur)) return false;
                cur = cur[part];
            }
            return typeof cur === 'string';
        };
        const ko = loadJson('lang/ko.json');
        const en = loadJson('lang/en.json');
        const missingKo = [...refs].filter((r) => !resolve(r, ko));
        const missingEn = [...refs].filter((r) => !resolve(r, en));
        expect(missingKo, `missing ko keys: ${missingKo.slice(0, 10).join(', ')}`).toEqual([]);
        expect(missingEn, `missing en keys: ${missingEn.slice(0, 10).join(', ')}`).toEqual([]);
    });
});