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

  it('renders a neutral css fallback when no hero image slot is uploaded', () => {
    render(<Hero site={site} copy={copy} media={null} />);
    expect(screen.getByTestId('hero-media-fallback')).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: /히어로/ })).not.toBeInTheDocument();
  });

  it('renders the uploaded image when the slot has a url', () => {
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