/**
 * 스크롤 리빌 계약 테스트 — 원문(_workspace/pinkbro/source)의 .reveal 이식 검증.
 *
 * 원문 리빌 42곳(body.html 전수)에 대응하는 템플릿 배선을 세 가지로 확인한다:
 *   1. 개수 — 섹션별 .pb-reveal 요소 수가 원문과 같다(합계 42).
 *   2. 방향·시차 — left/right/–와 --pb-delay 값이 원문 표와 같다.
 *   3. 동작 — IntersectionObserver 를 스텁으로 갈아 끼워, 관찰 → 교차 →
 *      pb-reveal--visible 부여 + unobserve → 교체 노드 재트리거 없음을 확인한다.
 *      (happy-dom 의 IO 는 콜백을 발화하지 않으므로 스텁이 필요하다.)
 */
import { render, cleanup } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Hero } from '../../src/components/Hero';
import { AboutSection } from '../../src/components/AboutSection';
import { ServiceGrid } from '../../src/components/ServiceGrid';
import { PackageList } from '../../src/components/PackageList';
import { PriceDiscount } from '../../src/components/PriceDiscount';
import { FaqList } from '../../src/components/FaqList';
import { CaseGallery } from '../../src/components/CaseGallery';
import { EstimateCalculator } from '../../src/components/EstimateCalculator';
import { InquiryForm } from '../../src/components/InquiryForm';
import { resetPbRevealForTests } from '../../src/lib/reveal';
import type {
    CopyData,
    DiscountStep,
    FaqItem,
    MediaSlots,
    PackageItem,
    ServiceItem,
    SiteData,
} from '../../src/lib/types';

/** 관찰 호출을 기록하는 IntersectionObserver 스텁 */
class StubIntersectionObserver {
    static last: StubIntersectionObserver | null = null;
    observed = new Set<Element>();
    unobserved: Element[] = [];
    options: unknown;

    constructor(
        private callback: (entries: Array<{ target: Element; isIntersecting: boolean }>) => void,
        options?: unknown,
    ) {
        this.options = options;
        StubIntersectionObserver.last = this;
    }

    observe(node: Element): void {
        this.observed.add(node);
    }

    unobserve(node: Element): void {
        this.observed.delete(node);
        this.unobserved.push(node);
    }

    disconnect(): void {
        this.observed.clear();
    }

    /** 스텁을 발화시킨다 — 관찰 중인 노드를 전부 교차 상태로 만든다. */
    fireAll(): void {
        this.callback([...this.observed].map((target) => ({ target, isIntersecting: true })));
    }
}

const site: SiteData = {
    brand_name: '핑크브로클린케어',
    brand_name_en: 'PINKBRO CLEANCARE',
    tagline: '깨끗한 공간, 더 나은 오늘',
    eyebrow: 'F&B Hygiene Care Specialist',
    phone: '010-4348-8158',
    kakao_channel: 'http://pf.kakao.com/_gmcuG',
    region: '부산·울산·경남',
    og_image_slot: 'site_og',
};

const media: MediaSlots = {
    hero_main: { url: null, alt: null },
    why_stage: { url: '/uploads/why.png', alt: '왜 핑크브로인가' },
    package_stage: { url: '/uploads/package.png', alt: '패키지' },
    estimate_bg: { url: '/uploads/estimate.png', alt: '문의 배경' },
};

const serviceItem = (slug: string, index: number): ServiceItem => ({
    slug,
    title: `서비스 ${index + 1}`,
    tag: 'Service',
    summary: '요약',
    criteria: '기준',
    base_price: '250,000',
    extra_note: '면적에 따라 달라집니다.',
    photo: { url: null, alt: null },
});

const packages: PackageItem[] = [
    { title: 'A 패키지', summary: '요약', includes: ['바닥'], base_total: '250,000', price: '242,500', discount_rate: 3, is_featured: false },
    { title: 'B 패키지', summary: '요약', includes: ['바닥'], base_total: '650,000', price: '617,500', discount_rate: 5, is_featured: false },
    { title: 'C 패키지', summary: '요약', includes: ['바닥'], base_total: '900,000', price: '810,000', discount_rate: 10, is_featured: true },
];

const steps: DiscountStep[] = [{ condition: '2개 항목', amount_label: '3%' }];

const faqItems: FaqItem[] = Array.from({ length: 8 }, (_, i) => ({
    question: `질문 ${i + 1}`,
    answer: '답변',
}));

const cases = Array.from({ length: 4 }, (_, i) => ({
    title: `CASE ${String(i + 1).padStart(2, '0')}`,
    summary: '요약',
    blog_url: '',
    cover: { url: null, alt: null },
}));

const copy: CopyData = {
    hero_headline: 'F&B 매장 전문\n위생 클린케어',
    hero_lead: '카페, 음식점, 베이커리, 주점, 프랜차이즈 매장까지.',
    hero_pills: ['부울경 전 지역 출장', '기본가격 공개', '현장확인 후 확정견적'],
    hero_visual_label: 'PINKBRO F&B HYGIENE CARE',
    hero_visual_message_label: 'BRAND MESSAGE',
    hero_visual_brand_message: '깨끗한 공간, 더 나은 오늘',
    hero_visual_body: '매장에 필요한 위생관리만\n더 체계적으로.',
    hero_scope: [
        { no: '01', title: 'Customer Area', body: '바닥 · 유리 · 어닝 · 간판' },
        { no: '02', title: 'Kitchen Hygiene', body: '상업용 후드 · 주방 관리' },
        { no: '03', title: 'Air Care', body: '에어컨 분해세척' },
    ],
    hero_cta_primary: '간편견적 문의하기',
    hero_cta_secondary: '가격 · 예상견적 보기',
    about_heading: '왜 핑크브로인가',
    about_message: '매장을 쓰는 사람의 하루를 먼저 생각합니다.',
    about_side_heading: '브랜드 관점',
    about_stage_eyebrow: 'Why Pinkbro',
    about_side_eyebrow: 'Brand Perspective',
    about_perspectives: [
        { title: '현장 기준', body: '현장에서 확인합니다.' },
        { title: '위생 기준', body: '위생을 기준으로 봅니다.' },
        { title: '유지 기준', body: '유지 가능한 상태를 만듭니다.' },
    ],
    service_eyebrow: 'Core Service',
    service_intro: '서비스 안내',
    service_intro_sub: '서비스별 기본 작업 조건과 시작가를 먼저 확인할 수 있습니다.',
    service_detail_label: '자세한 작업기준 확인',
    extra_box_heading: '찾으시는 서비스가 목록에 없나요?',
    extra_box_body: '기타 관리가 필요하시면 문의해 주세요.',
    extra_box_cta: '기타 서비스 문의하기',
    package_stage_eyebrow: 'Pinkbro F&B Package',
    package_intro: '패키지 안내',
    package_intro_sub: '자주 선택하는 조합을 정리했습니다.',
    package_a_label: 'A Package',
    package_b_label: 'B Package',
    package_c_label: 'C Package',
    package_a_note: null,
    package_a_note_sub: null,
    package_b_note: null,
    package_b_note_sub: null,
    package_c_note: null,
    package_c_note_sub: null,
    benefit_eyebrow: 'Multi-Service Benefit',
    benefit_heading: '함께 맡길수록 더 효율적입니다.',
    benefit_sub: '서비스 종류 기준으로 항목을 계산합니다.',
    benefit_items: steps,
    pricing_eyebrow: 'Pricing',
    pricing_heading: '가격은 투명하게 안내합니다.',
    pricing_sub: '기본 작업 기준가를 먼저 보여드립니다.',
    pricing_notice: '표기 금액은 모두 기본 작업 기준가입니다.',
    pricing_notice_label: 'Pricing Notice',
    pricing_notice_sub: '시작가를 먼저 공개합니다.',
    pricing_field: '확정 견적은 현장확인 원칙으로 진행합니다.',
    pricing_flow_label: 'Estimate Flow',
    pricing_flow: '기본가 확인 → 문의 접수 → 현장확인 후 확정견적',
    estimator_eyebrow: 'Expected Estimate',
    estimator_heading: '예상 기본금액을 먼저 확인해 보세요.',
    estimator_sub: '항목을 체크하면 합계와 할인율이 계산됩니다.',
    estimator_summary_heading: '예상 기본금액 요약',
    estimator_summary_total_label: 'Estimated Base Price',
    estimator_summary_note: '모든 금액은 기본 작업 기준가입니다.',
    estimator_air_label: '에어컨 종류 선택',
    estimator_row_count: '선택한 서비스',
    estimator_row_base: '기본가 합계',
    estimator_row_discount: '적용 할인',
    estimator_row_discount_amount: '할인 금액',
    estimator_cta_submit: '이 구성으로 견적 문의하기',
    estimator_cta_kakao: '카카오채널 문의하기',
    faq_eyebrow: 'FAQ',
    faq_intro: '견적 전에 많이 묻는 내용을 먼저 확인해 보세요.',
    faq_intro_sub: '가격, 작업 기준, 출장지역을 정리했습니다.',
    projects_eyebrow: 'Recent Projects',
    projects_card_kicker: 'PINKBRO PROJECT',
    projects_link_label: '작업사례 자세히 보기',
    projects_intro: '작업사례',
    projects_sub: '현장의 작업 내용과 전후 과정입니다.',
    projects_note: '자세한 내용은 블로그에서 확인할 수 있습니다.',
    estimate_intro: '필요한 내용을 남겨주시면 확인 후 안내드립니다.',
    estimate_note: '사진 없이 간단하게 접수할 수 있습니다.',
    estimate_checklist: ['간단한 정보만 남기면 됩니다.'],
    estimate_panel_heading: '간편견적 문의하기',
    estimate_panel_sub: '업종, 서비스와 규모, 연락처를 남겨주세요.',
    estimate_panel_note: '사진은 카카오채널로 보내주세요.',
    footer_text: null,
    footer_brand_desc: null,
    footer_core_service_heading: null,
    footer_core_service: null,
    footer_more_service_heading: null,
    footer_more_service: null,
    footer_contact_heading: null,
    footer_contact_phone_label: null,
    footer_contact_kakao_label: null,
    header_cta: null,
    mobile_cta_estimate: null,
    mobile_cta_phone: null,
    mobile_cta_kakao: null,
};

const services: ServiceItem[] = [
    serviceItem('floor-care', 0),
    serviceItem('glass-care', 1),
    serviceItem('awning-care', 2),
    serviceItem('sign-care', 3),
    serviceItem('kitchen-care', 4),
    serviceItem('air-care', 5),
];

/** 섹션별 리빌 개수 — 원문 body.html 전수 표와 같아야 한다 */
function renderSection(which: string): { count: () => number; root: () => HTMLElement } {
    let container: HTMLElement;
    switch (which) {
        case 'hero':
            container = render(<Hero site={site} copy={copy} media={media} />).container;
            break;
        case 'about':
            container = render(<AboutSection copy={copy} media={media} />).container;
            break;
        case 'service':
            container = render(
                <ServiceGrid
                    eyebrow="Core Service"
                    intro="서비스 안내"
                    introSub="서비스별 기본 작업 조건과 시작가를 먼저 확인할 수 있습니다."
                    detailLabel="자세한 작업기준 확인"
                    extraHeading="찾으시는 서비스가 목록에 없나요?"
                    extraBody="기타 관리가 필요하시면 문의해 주세요."
                    extraCtaLabel="기타 서비스 문의하기"
                    items={services}
                    media={media}
                />,
            ).container;
            break;
        case 'package':
            container = render(
                <PackageList
                    stageEyebrow="Pinkbro F&B Package"
                    intro="패키지 안내"
                    introSub="자주 선택하는 조합을 정리했습니다."
                    labelA="A Package"
                    labelB="B Package"
                    labelC="C Package"
                    benefitHeading="함께 맡길수록 더 효율적입니다."
                    benefitSub="서비스 종류 기준으로 항목을 계산합니다."
                    benefitItems={steps}
                    items={packages}
                    media={media}
                />,
            ).container;
            break;
        case 'pricing':
            container = render(
                <>
                    <PriceDiscount
                        eyebrow="Pricing"
                        heading="가격은 투명하게 안내합니다."
                        sub="기본 작업 기준가를 먼저 보여드립니다."
                        notice="표기 금액은 모두 기본 작업 기준가입니다."
                        noticeLabel="Pricing Notice"
                        noticeSub="시작가를 먼저 공개합니다."
                        field="확정 견적은 현장확인 원칙으로 진행합니다."
                        flowLabel="Estimate Flow"
                        flow="기본가 확인 → 문의 접수 → 현장확인 후 확정견적"
                    />
                    <EstimateCalculator
                        eyebrow="Expected Estimate"
                        heading="예상 기본금액을 먼저 확인해 보세요."
                        sub="항목을 체크하면 합계와 할인율이 계산됩니다."
                        summaryHeading="예상 기본금액 요약"
                        summaryTotalLabel="Estimated Base Price"
                        summaryNote="모든 금액은 기본 작업 기준가입니다."
                        airLabel="에어컨 종류 선택"
                        rowCountLabel="선택한 서비스"
                        rowBaseLabel="기본가 합계"
                        rowDiscountLabel="적용 할인"
                        rowDiscountAmountLabel="할인 금액"
                        ctaSubmitLabel="이 구성으로 견적 문의하기"
                        ctaKakaoLabel="카카오채널 문의하기"
                        services={services}
                        steps={steps}
                        site={site}
                    />
                </>,
            ).container;
            break;
        case 'faq':
            container = render(<FaqList eyebrow="FAQ" intro="FAQ 제목" introSub="FAQ 보조" items={faqItems} />).container;
            break;
        case 'projects':
            container = render(
                <CaseGallery
                    eyebrow="Recent Projects"
                    intro="작업사례"
                    sub="현장의 작업 내용과 전후 과정입니다."
                    note="자세한 내용은 블로그에서 확인할 수 있습니다."
                    cardKicker="PINKBRO PROJECT"
                    linkLabel="작업사례 자세히 보기"
                    items={cases as never}
                    media={media}
                />,
            ).container;
            break;
        default:
            container = render(
                <InquiryForm
                    site={site}
                    services={services}
                    media={media}
                    intro="필요한 내용을 남겨주시면 확인 후 안내드립니다."
                    sub="사진 없이 간단하게 접수할 수 있습니다."
                    checklist={['간단한 정보만 남기면 됩니다.']}
                    panelHeading="간편견적 문의하기"
                    panelSub="업종, 서비스와 규모, 연락처를 남겨주세요."
                    panelNote="사진은 카카오채널로 보내주세요."
                />,
            ).container;
            break;
    }
    return {
        count: () => container.querySelectorAll('.pb-reveal').length,
        root: () => container,
    };
}

describe('스크롤 리빌 — 원문 .reveal 이식', () => {
    beforeEach(() => {
        resetPbRevealForTests();
        vi.stubGlobal('IntersectionObserver', StubIntersectionObserver as unknown as typeof IntersectionObserver);
    });

    afterEach(() => {
        cleanup();
        vi.unstubAllGlobals();
        resetPbRevealForTests();
    });

    it('섹션별 리빌 개수가 원문 42곳과 같다', () => {
        const expected: Record<string, number> = {
            hero: 3, // hero-shell / hero-scope / hero-visual-clean
            about: 5, // why-stage / copy / why-card ×3
            service: 9, // copy / sub / service-card ×6 / extra-box
            package: 5, // package-stage / pkg-card ×3 / benefit-box
            pricing: 4, // copy / sub / notice-box / estimator
            faq: 9, // faq-intro / faq-item ×8
            projects: 6, // copy / sub / project-card ×4
            estimate: 1, // estimate-shell
        };
        let total = 0;
        for (const [section, count] of Object.entries(expected)) {
            const { count: actual } = renderSection(section);
            expect(actual(), section).toBe(count);
            total += actual();
            cleanup();
        }
        expect(total).toBe(42);
    });

    it('원문 표와 같은 방향(left/right)과 시차를 배선한다', () => {
        // --- hero ---
        const hero = renderSection('hero').root();
        const shell = hero.querySelector('.pb-hero-shell.pb-reveal');
        expect(shell).not.toBeNull();
        expect((shell as HTMLElement).style.getPropertyValue('--pb-delay')).toBe('');
        const scope = hero.querySelector('.pb-hero-scope.pb-reveal');
        expect((scope as HTMLElement).style.getPropertyValue('--pb-delay')).toBe('0.08s');
        const visual = hero.querySelector('.pb-hero-media.pb-reveal');
        expect(visual?.classList.contains('pb-reveal--right')).toBe(true);
        expect((visual as HTMLElement).style.getPropertyValue('--pb-delay')).toBe('0.08s');
        cleanup();

        // --- about — why-stage left / copy right / why-card right .03/.08/.13 ---
        const about = renderSection('about').root();
        expect(about.querySelector('.pb-why-stage')?.classList.contains('pb-reveal--left')).toBe(true);
        expect(about.querySelector('.pb-why-copy')?.classList.contains('pb-reveal--right')).toBe(true);
        const whyCards = [...about.querySelectorAll('.pb-why-card')];
        expect(whyCards.map((c) => (c as HTMLElement).style.getPropertyValue('--pb-delay'))).toEqual(['0.03s', '0.08s', '0.13s']);
        expect(whyCards.every((c) => c.classList.contains('pb-reveal--right'))).toBe(true);
        cleanup();

        // --- service — 카드 시차 .02/.06/.10/.14/.18/.22 ---
        const service = renderSection('service').root();
        expect(service.querySelector('.pb-section-copy')?.classList.contains('pb-reveal--right')).toBe(false);
        expect(service.querySelector('.pb-services-sub')?.classList.contains('pb-reveal--right')).toBe(true);
        const serviceCards = [...service.querySelectorAll('.pb-service-card')];
        expect(serviceCards.map((c) => (c as HTMLElement).style.getPropertyValue('--pb-delay'))).toEqual(['0.02s', '0.06s', '0.10s', '0.14s', '0.18s', '0.22s']);
        expect((service.querySelector('.pb-extra-box') as HTMLElement).style.getPropertyValue('--pb-delay')).toBe('0.08s');
        cleanup();

        // --- package — 카드 시차 .02/.08/.14(featured) ---
        const pkg = renderSection('package').root();
        const pkgCards = [...pkg.querySelectorAll('.pb-pkg-card')];
        expect(pkgCards.map((c) => (c as HTMLElement).style.getPropertyValue('--pb-delay'))).toEqual(['0.02s', '0.08s', '0.14s']);
        expect(pkgCards[2].classList.contains('pb-pkg-card--featured')).toBe(true);
        expect((pkg.querySelector('.pb-benefit-box') as HTMLElement).style.getPropertyValue('--pb-delay')).toBe('0.08s');
        cleanup();

        // --- pricing — estimator .08 ---
        const pricing = renderSection('pricing').root();
        expect(pricing.querySelector('.pb-pricing-head-copy')?.classList.contains('pb-reveal')).toBe(true);
        expect(pricing.querySelector('.pb-pricing-sub')?.classList.contains('pb-reveal--right')).toBe(true);
        expect(pricing.querySelector('.pb-pricing-notice')?.classList.contains('pb-reveal')).toBe(true);
        expect((pricing.querySelector('.pb-estimator') as HTMLElement).style.getPropertyValue('--pb-delay')).toBe('0.08s');
        cleanup();

        // --- faq — intro left, 항목 8장 시차 없음 ---
        const faq = renderSection('faq').root();
        expect(faq.querySelector('.pb-faq-intro')?.classList.contains('pb-reveal--left')).toBe(true);
        const faqDomItems = [...faq.querySelectorAll('.pb-faq-item')];
        expect(faqDomItems).toHaveLength(8);
        expect(faqDomItems.every((el) => (el as HTMLElement).style.getPropertyValue('--pb-delay') === '')).toBe(true);
        cleanup();

        // --- projects — 카드 시차 –/.04/.08/.12 ---
        const projects = renderSection('projects').root();
        expect(projects.querySelector('.pb-projects__copy')?.classList.contains('pb-reveal')).toBe(true);
        expect(projects.querySelector('.pb-projects__sub')?.classList.contains('pb-reveal--right')).toBe(true);
        const projectCards = [...projects.querySelectorAll('.pb-project-card')];
        expect(projectCards.map((c) => (c as HTMLElement).style.getPropertyValue('--pb-delay'))).toEqual(['0s', '0.04s', '0.08s', '0.12s']);
        cleanup();

        // --- estimate — shell 시차 없음 ---
        const estimate = renderSection('estimate').root();
        const estimateShell = estimate.querySelector('.pb-inquiry-shell.pb-reveal');
        expect(estimateShell).not.toBeNull();
        expect((estimateShell as HTMLElement).style.getPropertyValue('--pb-delay')).toBe('');
    });

    it('마운트되면 html.pb-js 를 붙이고, 리빌 요소를 관찰한다', () => {
        expect(document.documentElement.classList.contains('pb-js')).toBe(false);
        const hero = renderSection('hero').root();
        // 원문 threshold 0.14 (app.js 8행)
        expect(StubIntersectionObserver.last?.options).toEqual({ threshold: 0.14 });
        // 관찰 대상: 콘텐츠가 있는 리빌 3곳 (shell / scope / visual)
        const observed = [...(StubIntersectionObserver.last?.observed ?? [])];
        expect(observed).toHaveLength(3);
        expect(observed.every((n) => n.classList.contains('pb-reveal'))).toBe(true);
        expect(document.documentElement.classList.contains('pb-js')).toBe(true);
        // visible 은 아직 없다 — 관찰자가 발화하기 전까지 숨김 상태다(CSS 가 담당).
        expect(hero.querySelector('.pb-reveal--visible')).toBeNull();
    });

    it('교차하면 visible 을 부여하고 unobserve 한다 (원문 app.js 3~6행)', () => {
        renderSection('service').root();
        const observer = StubIntersectionObserver.last;
        expect(observer).not.toBeNull();
        // 카드 6장 + copy + sub + extra = 9곳이 관찰된다
        expect(observer?.observed.size).toBe(9);
        observer?.fireAll();
        // visible 부여
        const cards = document.querySelectorAll('.pb-service-card.pb-reveal--visible');
        expect(cards).toHaveLength(6);
        // unobserve — 교차한 노드는 더 이상 관찰되지 않는다
        expect(observer?.observed.size).toBe(0);
        expect(observer?.unobserved.length).toBe(9);
    });

    it('같은 key 의 노드가 교체되면 리빌을 다시 트리거하지 않는다', () => {
        // 1차 마운트 → 교차 → 리빌 완료
        const first = renderSection('about').root();
        const firstCard = first.querySelector('.pb-why-card') as HTMLElement;
        StubIntersectionObserver.last?.fireAll();
        expect(firstCard.classList.contains('pb-reveal--visible')).toBe(true);
        cleanup();

        // 2차 마운트(데이터 갱신을 시뮬레이트) — 같은 key 의 새 노드는
        // 관찰되지 않고 즉시 visible 이다.
        const second = renderSection('about').root();
        const secondCard = second.querySelector('.pb-why-card') as HTMLElement;
        expect(secondCard.classList.contains('pb-reveal--visible')).toBe(true);
        // 아직 교차하지 않은 key(faq-intro 등 다른 섹션)는 여전히 관찰 경로를 탄다
        const faqRoot = renderSection('faq').root();
        const faqIntro = faqRoot.querySelector('.pb-faq-intro') as HTMLElement;
        expect(faqIntro.classList.contains('pb-reveal--visible')).toBe(false);
        expect(StubIntersectionObserver.last?.observed.has(faqIntro)).toBe(true);
    });

    it('IntersectionObserver 가 없으면 숨기지도 관찰하지도 않는다', () => {
        vi.unstubAllGlobals();
        // IO 미지원 환경 시뮬레이션 — pb-js 도 붙으면 안 된다(숨기면 풀어 줄 방법이 없다).
        const original = (globalThis as { IntersectionObserver?: unknown }).IntersectionObserver;
        delete (globalThis as { IntersectionObserver?: unknown }).IntersectionObserver;
        try {
            const hero = renderSection('hero').root();
            expect(document.documentElement.classList.contains('pb-js')).toBe(false);
            // CSS 숨김 상태(html.pb-js .pb-reveal)가 적용될 수 없는 상태다.
            expect(hero.querySelectorAll('.pb-reveal').length).toBeGreaterThan(0);
        } finally {
            (globalThis as { IntersectionObserver?: unknown }).IntersectionObserver = original;
        }
    });
});