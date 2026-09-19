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
});