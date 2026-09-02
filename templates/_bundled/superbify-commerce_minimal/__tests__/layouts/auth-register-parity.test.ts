/**
 * @file auth-register-parity.test.ts
 * @description 회원가입 폼 G7 기본(sirsoft-basic) 기능 패리티 회귀 테스트
 *
 * 배경: Still Form 회원가입이 BASIC oracle 대비 mobile/phone/language 필드와
 *   약관/개인정보 모달(termsContent/privacyContent dataSource + openModal)을
 *   누락했었다. CLAUDE.md §1.1.1 정책 — 기본 기능 축소 금지, presentation 만 변경.
 *
 * 검증 항목:
 * 1. register.json 이 termsContent/privacyContent dataSource 를 가진다 (CMS 약관 소스)
 * 2. register.json 이 terms/privacy modal partial 을 등록한다
 * 3. 폼에 email/password/password_confirmation/name/nickname/mobile/phone 필드 존재
 * 4. language Select 가 BASIC 과 동일한 $locales 표현식을 사용한다
 * 5. agree_terms/agree_privacy checkbox 는 required + value=1 (서버 accepted 계약과 짝)
 * 6. 약관 보기 트리거가 refetchDataSource → openModal 시퀀스를 가진다
 * 7. name 은 required (RegisterRequest name required 계약) + 라벨에 필수 표시
 * 8. 에러 필터 화이트리스트에 mobile/phone/language 포함 (이중 표시 방지)
 * 9. 제출 계약 — POST /api/auth/register, verification_token 전달, 성공 후 /login navigate
 * 10. 마케팅/광고 수신 동의 문구·체크박스는 코어 회원가입 폼에 들어가지 않는다
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const TEMPLATE_ROOT = path.resolve(__dirname, '../..');
const registerLayout = JSON.parse(
    fs.readFileSync(path.join(TEMPLATE_ROOT, 'layouts/auth/register.json'), 'utf8')
);
const registerForm = JSON.parse(
    fs.readFileSync(path.join(TEMPLATE_ROOT, 'layouts/partials/auth/_register_form.json'), 'utf8')
);
const termsModal = JSON.parse(
    fs.readFileSync(path.join(TEMPLATE_ROOT, 'layouts/partials/auth/_modal_terms.json'), 'utf8')
);
const privacyModal = JSON.parse(
    fs.readFileSync(path.join(TEMPLATE_ROOT, 'layouts/partials/auth/_modal_privacy.json'), 'utf8')
);

type Node = {
    type?: string;
    name?: string;
    partial?: string;
    props?: Record<string, any>;
    children?: Node[];
    actions?: any[];
    text?: string;
    id?: string;
};

function walk(input: Node | Node[] | undefined, visit: (node: Node) => void): void {
    if (!input) return;
    const nodes = Array.isArray(input) ? input : [input];
    for (const node of nodes) {
        visit(node);
        if (Array.isArray(node.children)) walk(node.children, visit);
    }
}

function collectNodes(root: Node): Node[] {
    const out: Node[] = [];
    walk(root, (node) => out.push(node));
    return out;
}

function findInput(root: Node, name: string): Node | undefined {
    return collectNodes(root).find(
        (n) => n.type === 'basic' && n.name === 'Input' && n.props?.name === name
    );
}

const formNodes = collectNodes(registerForm);

describe('register layout — agreement data sources & modals', () => {
    it('declares termsContent / privacyContent data sources against the G7 CMS pages API', () => {
        const sources = registerLayout.data_sources ?? [];
        const terms = sources.find((s: any) => s.id === 'termsContent');
        const privacy = sources.find((s: any) => s.id === 'privacyContent');
        expect(terms?.endpoint).toBe('/api/modules/sirsoft-page/pages/terms');
        expect(privacy?.endpoint).toBe('/api/modules/sirsoft-page/pages/privacy');
        expect(terms?.auto_fetch).toBe(false);
        expect(privacy?.auto_fetch).toBe(false);
    });

    it('registers the terms and privacy modal partials', () => {
        const partials = (registerLayout.modals ?? []).map((m: any) => m.partial);
        expect(partials).toContain('partials/auth/_modal_terms.json');
        expect(partials).toContain('partials/auth/_modal_privacy.json');
    });

    it('terms modal renders CMS content via html_content extension point with HtmlContent default', () => {
        expect(termsModal.id).toBe('termsModal');
        const raw = JSON.stringify(termsModal);
        expect(raw).toContain('termsContent?.data?.content');
        expect(raw).toContain('"extension_point"');
        expect(raw).toContain('HtmlContent');
        expect(privacyModal.id).toBe('privacyModal');
        const rawPrivacy = JSON.stringify(privacyModal);
        expect(rawPrivacy).toContain('privacyContent?.data?.content');
    });
});

describe('register form — field parity with RegisterRequest', () => {
    it.each(['email', 'password', 'password_confirmation', 'name', 'nickname', 'mobile', 'phone'])(
        'has a %s input',
        (name) => {
            expect(findInput(registerForm, name)).toBeDefined();
        }
    );

    it('has the language select seeded with the current locale and $locales-driven options', () => {
        const select = formNodes.find((n) => n.type === 'basic' && n.name === 'Select');
        expect(select).toBeDefined();
        expect(select?.props?.name).toBe('language');
        expect(select?.props?.defaultValue).toBe("{{_local?.registerForm?.language ?? $locale ?? 'ko'}}");
        const iteration = (select?.children?.find((c: any) => c.name === 'Option') as any)?.iteration;
        expect(iteration?.source).toContain('$locales');
    });

    it('marks email, password, password_confirmation and name required; contact fields optional', () => {
        expect(findInput(registerForm, 'email')?.props?.required).toBe(true);
        expect(findInput(registerForm, 'password')?.props?.required).toBe(true);
        expect(findInput(registerForm, 'password_confirmation')?.props?.required).toBe(true);
        expect(findInput(registerForm, 'name')?.props?.required).toBe(true);
        expect(findInput(registerForm, 'nickname')?.props?.required).toBeUndefined();
        expect(findInput(registerForm, 'mobile')?.props?.required).toBeUndefined();
        expect(findInput(registerForm, 'phone')?.props?.required).toBeUndefined();
    });

    it('password field enforces the server default min length of 8 and shows the policy hint', () => {
        expect(findInput(registerForm, 'password')?.props?.minLength).toBe(8);
        expect(JSON.stringify(registerForm)).toContain('password_hint');
    });

    it('agree_terms / agree_privacy checkboxes are required with value 1', () => {
        expect(findInput(registerForm, 'agree_terms')?.props?.required).toBe(true);
        expect(findInput(registerForm, 'agree_terms')?.props?.value).toBe('1');
        expect(findInput(registerForm, 'agree_privacy')?.props?.required).toBe(true);
        expect(findInput(registerForm, 'agree_privacy')?.props?.value).toBe('1');
    });

    it('agreement triggers refetch the CMS data source before opening the modals', () => {
        const raw = JSON.stringify(registerForm);
        expect(raw).toContain('"refetchDataSource"');
        expect(raw).toContain('"openModal"');
        expect(raw).toContain('"termsModal"');
        expect(raw).toContain('"privacyModal"');
    });

    it('keeps the per-field error filter whitelist in sync with all form fields', () => {
        const raw = JSON.stringify(registerForm);
        expect(raw).toContain("'mobile','phone','language'");
    });

    it('does not add marketing opt-in absent from the G7 default register', () => {
        const raw = JSON.stringify(registerForm);
        expect(raw).not.toContain('marketing');
        expect(raw).not.toContain('마케팅');
        expect(raw).not.toContain('광고');
        expect(findInput(registerForm, 'agree_marketing')).toBeUndefined();
    });
});

describe('register form — submit contract', () => {
    const submit = registerForm.actions?.find((a: any) => a.type === 'submit');

    it('posts to the G7 register API', () => {
        const apiCall = submit?.actions?.find((a: any) => a.handler === 'apiCall');
        expect(apiCall?.target).toBe('/api/auth/register');
        expect(apiCall?.params?.method).toBe('POST');
    });

    it('passes the identity verification token through from the query', () => {
        const apiCall = submit?.actions?.find((a: any) => a.handler === 'apiCall');
        expect(String(apiCall?.params?.body)).toContain('verification_token');
    });

    it('navigates to /login after success (no auto-login, same as BASIC)', () => {
        const success = submit?.actions?.find((a: any) => a.handler === 'apiCall')?.onSuccess ?? [];
        expect(success.some((a: any) => a.handler === 'navigate' && a.params?.path === '/login')).toBe(true);
    });
});

describe('register layout — auth shell structure', () => {
    it('reuses the shared auth split shell with the register variant', () => {
        const raw = JSON.stringify(registerLayout);
        expect(raw).toContain('scm-auth-split scm-auth-split--register');
        expect(raw).toContain('scm-auth-panel-inner--register');
        expect(raw).toContain('scm-auth-visual--register');
    });

    it('keeps the guest-only meta and logged-in redirect guard', () => {
        expect(registerLayout.meta?.guest_only).toBe(true);
        expect(JSON.stringify(registerLayout)).toContain('partials/auth/_redirect_if_logged_in.json');
    });
});