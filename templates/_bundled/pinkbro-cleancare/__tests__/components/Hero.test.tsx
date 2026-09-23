import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Hero from '../../src/components/Hero';

const heroCss = (): string =>
  readFileSync(join(__dirname, '..', '..', 'src', 'styles', 'Hero.css'), 'utf8');

const site = {
  brand_name: '핑크브로클린케어', brand_name_en: 'PINKBRO CLEANCARE',
  tagline: '깨끗한 공간, 더 나은 오늘', eyebrow: 'F&B Hygiene Care Specialist',
  phone: '010-4348-8158', kakao_channel: 'http://pf.kakao.com/_gmcuG',
  region: '부산·울산·경남', og_image_slot: 'site_og',
};
const copy = {
  hero_headline: 'F&B 매장 전문\n위생 클린케어',
  hero_lead: '카페, 음식점, 베이커리, 주점, 프랜차이즈 매장까지.',
  hero_pills: ['부울경 전 지역 출장', '기본가격 공개', '현장확인 후 확정견적'],
} as any;

const PLACEHOLDER_SRC =
  '/api/templates/assets/pinkbro-cleancare?file=images/hero-visual.webp';
const SHELL_BG_SRC =
  '/api/templates/assets/pinkbro-cleancare?file=images/hero-shell.webp';

describe('Hero', () => {
  it('renders a loading skeleton when site data is null', () => {
    render(<Hero site={null} copy={null} media={null} />);
    expect(screen.getByTestId('hero-skeleton')).toBeInTheDocument();
  });

  it('renders the headline and lead from the module copy', () => {
    render(<Hero site={site} copy={copy} media={null} />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/카페, 음식점, 베이커리/)).toBeInTheDocument();
  });

  it('renders the bundled placeholder photo when no hero image slot is uploaded', () => {
    const { unmount } = render(<Hero site={site} copy={copy} media={null} />);
    expect(screen.getByTestId('hero-media-img')).toHaveAttribute('src', PLACEHOLDER_SRC);
    expect(screen.queryByTestId('hero-media-fallback')).not.toBeInTheDocument();
    unmount();

    // 슬롯 키는 있고 값만 비어도(업로드 없음) 자리표시자가 그 자리를 채운다
    render(<Hero site={site} copy={copy} media={{ hero_main: { url: null, alt: null } }} />);
    expect(screen.getByTestId('hero-media-img')).toHaveAttribute('src', PLACEHOLDER_SRC);
    expect(screen.queryByTestId('hero-media-fallback')).not.toBeInTheDocument();
  });

  it('renders the uploaded image when the slot has a url — 업로드가 자리표시자를 이긴다', () => {
    render(<Hero site={site} copy={copy} media={{ hero_main: { url: '/x.webp', alt: '매장' } }} />);
    expect(screen.getByRole('img', { name: '매장' })).toHaveAttribute('src', '/x.webp');
    expect(screen.queryByTestId('hero-media-fallback')).not.toBeInTheDocument();
  });

  it('never renders an external image url', () => {
    const { container } = render(<Hero site={site} copy={copy} media={null} />);
    expect(container.innerHTML).not.toMatch(/unsplash\.com/);
  });

  it('paints the bundled hero-shell photo behind the scrim when hero_sub slot is empty', () => {
    const { unmount } = render(<Hero site={site} copy={copy} media={null} />);
    const shell = document.querySelector('.pb-hero-shell') as HTMLElement;
    expect(shell.style.backgroundImage).toBe(`url("${SHELL_BG_SRC}")`);
    expect(shell.style.backgroundSize).toBe('cover');
    // jsdom 을 비롯한 CSSOM 은 background-position 의 단일 키워드 center 를 center center 로 정규화한다
    expect(shell.style.backgroundPosition).toBe('center center');
    unmount();

    // 슬롯 키는 있고 값만 비어도(업로드 없음) 번들 배경이 그 자리를 채운다
    render(<Hero site={site} copy={copy} media={{ hero_sub: { url: null, alt: null } }} />);
    expect((document.querySelector('.pb-hero-shell') as HTMLElement).style.backgroundImage)
      .toBe(`url("${SHELL_BG_SRC}")`);
  });

  it('the uploaded hero_sub url wins the shell background — 업로드가 항상 이긴다', () => {
    render(<Hero site={site} copy={copy} media={{ hero_sub: { url: '/shell.webp', alt: 'a' } }} />);
    const shell = document.querySelector('.pb-hero-shell') as HTMLElement;
    expect(shell.style.backgroundImage).toBe('url("/shell.webp")');
    // 셸 베이스 컬러는 CSS 가 유지한다 — 배경 사진은 그 위에 깔린다
    expect(shell.className).toContain('pb-hero-shell');
  });

  it('keeps a plain shell when neither slot nor bundle has a background', async () => {
    // SLOT_PHOTO.hero_sub 가 사라진 상황을 시뮬레이션 — Hero 는 slotPhotoFor 로만 소비하므로
    // slotPhotoFor 이 null 을 돌려주면 배경 인라인 스타일이 아예 남지 않아야 한다.
    // (모듈 스코프의 SLOT_PHOTO 객체만 갈아끼우는 doMock 스프레드는 slotPhotoFor 내부
    //  바인딩을 바꾸지 못하므로 함수 자체를 갈아끼운다. 또한 파일 상단의 정적 import 가
    //  Hero 를 이미 평가해 두었으므로 resetModules 로 캐시를 비운 뒤 다시 import 해야
    //  doMock 이 적용된 모듈 그래프로 평가된다.)
    vi.resetModules();
    vi.doMock('../../src/lib/serviceAssets', async (importOriginal) => ({
      ...(await importOriginal<object>()),
      slotPhotoFor: () => null,
    }));
    try {
      const { default: HeroFresh } = await import('../../src/components/Hero');
      const { container } = render(
        <HeroFresh site={site} copy={copy} media={null} />,
      );
      const shell = container.querySelector('.pb-hero-shell') as HTMLElement;
      expect(shell.style.backgroundImage).toBe('');
    } finally {
      vi.doUnmock('../../src/lib/serviceAssets');
      vi.resetModules();
    }
  });

  it('renders the hero visual copy from the copy domain (label / brand message / body)', () => {
    render(
      <Hero
        site={site}
        copy={{
          ...copy,
          hero_visual_label: 'PINKBRO F&B HYGIENE CARE',
          hero_visual_brand_message: '깨끗한 공간, 더 나은 오늘',
          hero_visual_body: '매장에 필요한 위생관리만\n더 체계적으로.',
        }}
        media={null}
      />,
    );

    expect(screen.getByTestId('hero-visual-label')).toHaveTextContent('PINKBRO F&B HYGIENE CARE');
    expect(screen.getByText('깨끗한 공간, 더 나은 오늘')).toBeInTheDocument();

    const body = screen.getByTestId('hero-visual-body');
    expect(body.textContent).toBe('매장에 필요한 위생관리만더 체계적으로.');
    // 원문 <br> 은 \n 으로 보존된다 — 값의 개행이 <br> 로 렌더되어야 한다
    expect(body.querySelectorAll('br')).toHaveLength(1);
  });

  it('renders the three hero scope cards from hero_scope', () => {
    render(
      <Hero
        site={site}
        copy={{
          ...copy,
          hero_scope: [
            { no: '01', title: 'Customer Area', body: '바닥 · 유리 · 어닝 · 간판' },
            { no: '02', title: 'Kitchen Hygiene', body: '상업용 후드 · 주방 관리' },
            { no: '03', title: 'Air Care', body: '에어컨 분해세척' },
          ],
        }}
        media={null}
      />,
    );

    const scope = screen.getByTestId('hero-scope');
    expect(scope.children).toHaveLength(3);
    expect(scope).toHaveTextContent('Customer Area');
    expect(scope).toHaveTextContent('바닥 · 유리 · 어닝 · 간판');
    expect(scope).toHaveTextContent('Air Care');
  });

  it('omits the scope block when hero_scope is null', () => {
    render(<Hero site={site} copy={{ ...copy, hero_scope: null }} media={null} />);
    expect(screen.queryByTestId('hero-scope')).not.toBeInTheDocument();
  });

  it('renders the two hero CTAs from the copy domain (hero_cta_primary / hero_cta_secondary)', () => {
    render(
      <Hero
        site={site}
        copy={{
          ...copy,
          hero_cta_primary: '간편견적 문의하기',
          hero_cta_secondary: '가격 · 예상견적 보기',
        }}
        media={null}
      />,
    );

    const primary = screen.getByTestId('hero-cta-primary');
    expect(primary).toHaveTextContent('간편견적 문의하기');
    expect(primary).toHaveAttribute('href', '#estimate');
    expect(primary.tagName).toBe('A');
    // 원문 .btn.primary — 공용 .pb-btn 위에 핑크 변형을 덮는다
    expect(primary.className).toContain('pb-btn');
    expect(primary.className).toContain('pb-hero-cta--primary');

    const secondary = screen.getByTestId('hero-cta-secondary');
    expect(secondary).toHaveTextContent('가격 · 예상견적 보기');
    expect(secondary).toHaveAttribute('href', '#pricing');
    expect(secondary.className).toContain('pb-hero-cta--soft');

    // 원문 .hero-actions — CTA 가 pills 보다 먼저 온다
    const actions = screen.getByTestId('hero-actions');
    expect(
      actions.compareDocumentPosition(screen.getByTestId('hero-pills')) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it('omits each hero CTA whose copy key is null — 리터럴로 대체하지 않는다', () => {
    const { unmount } = render(
      <Hero
        site={site}
        copy={{ ...copy, hero_cta_primary: '간편견적 문의하기', hero_cta_secondary: null }}
        media={null}
      />,
    );
    expect(screen.getByTestId('hero-cta-primary')).toBeInTheDocument();
    expect(screen.queryByTestId('hero-cta-secondary')).not.toBeInTheDocument();
    unmount();

    render(
      <Hero
        site={site}
        copy={{ ...copy, hero_cta_primary: null, hero_cta_secondary: null }}
        media={null}
      />,
    );
    // 두 키가 모두 없으면 액션 줄 자체가 남지 않는다 (리터럴 CTA 가 살아나면 여기서 깨진다)
    expect(screen.queryByTestId('hero-actions')).not.toBeInTheDocument();
    expect(screen.queryByTestId('hero-cta-primary')).not.toBeInTheDocument();
    expect(screen.getByTestId('hero')).toBeInTheDocument();
  });

  it('renders the visual brand-message label from copy (hero_visual_message_label)', () => {
    const { unmount } = render(
      <Hero
        site={site}
        copy={{
          ...copy,
          hero_visual_message_label: 'BRAND MESSAGE',
          hero_visual_brand_message: '깨끗한 공간, 더 나은 오늘',
        }}
        media={null}
      />,
    );
    const label = screen.getByTestId('hero-visual-message-label');
    expect(label).toHaveTextContent('BRAND MESSAGE');
    expect(label.tagName).toBe('SPAN');
    // 라벨이 브랜드 메시지(b) 바로 위에 온다
    expect(
      label.compareDocumentPosition(screen.getByText('깨끗한 공간, 더 나은 오늘')) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    unmount();

    render(
      <Hero
        site={site}
        copy={{ ...copy, hero_visual_message_label: null, hero_visual_brand_message: '메시지' }}
        media={null}
      />,
    );
    expect(screen.queryByTestId('hero-visual-message-label')).not.toBeInTheDocument();
    expect(screen.getByText('메시지')).toBeInTheDocument();
  });

  it('renders inline <em>/<strong> markup instead of printing the tags', () => {
    const { container } = render(
      <Hero
        site={site}
        copy={{
          hero_headline: 'F&B 매장 전문\n<em>위생 클린케어</em>',
          hero_lead:
            '카페, 음식점, 베이커리, 주점, 프랜차이즈 매장까지.\n<strong>고객공간부터 주방, 공조환경까지 필요한 위생관리를 한 곳에서 제공합니다.</strong>',
          hero_pills: null,
        } as any}
        media={null}
      />,
    );

    expect(screen.getByRole('heading', { level: 1 }).querySelectorAll('em')).toHaveLength(1);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('위생 클린케어');
    expect(container.querySelector('.pb-lead strong')).not.toBeNull();
    expect(container.querySelector('.pb-lead strong')).toHaveTextContent('고객공간부터 주방');
    // 태그가 문자열로 노출되지 않는다
    expect(container.textContent).not.toContain('<em>');
    expect(container.textContent).not.toContain('<strong>');
  });

  it('keeps the source scrim over the hero visual photo (.pb-hero-media::after)', () => {
    // 원문 .hero-visual-clean 배경 첫 레이어(_workspace/pinkbro/source/styles.css:101) —
    // 사진 위 180° 세로 스크림(상 .02 → 하 .64). 이 값이 빠지면 사진 위 하단
    // BRAND MESSAGE 바가 읽히지 않는다. (원문 표기 rgba(12,14,19,.02) — 공백만 다름)
    const flat = heroCss().replace(/\s+/g, ' ');

    expect(flat).toContain('.pb-hero-media::after');
    for (const stop of ['rgba(12, 14, 19, .02) 28%', 'rgba(12, 14, 19, .64) 100%']) {
      expect(flat).toContain(stop);
    }

    // 스택은 원문과 같다 — 사진(0) 위 스크림(1), 라벨·BRAND MESSAGE 카드(2).
    // 슬롯 업로드 사진이 무엇이든 오버레이는 같아서 대비가 유지된다.
    expect(flat).toMatch(/\.pb-hero-media::after { [^}]*z-index: 1;/);
    expect(flat).toMatch(/\.pb-hero-visual-label { [^}]*z-index: 2;/);
    expect(flat).toMatch(/\.pb-hero-visual-bottom { [^}]*z-index: 2;/);

    // 스톡 URL 은 되살아나지 않는다
    expect(flat).not.toMatch(/unsplash\.com/);
  });
});