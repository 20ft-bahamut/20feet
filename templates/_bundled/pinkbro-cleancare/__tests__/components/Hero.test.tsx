import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Hero from '../../src/components/Hero';

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
  '/api/templates/assets/pinkbro-cleancare?file=images/service-kitchen-care.webp';

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
});