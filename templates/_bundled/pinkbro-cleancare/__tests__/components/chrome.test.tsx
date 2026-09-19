import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SiteHeader, telHref } from '../../src/components/SiteHeader';
import { SiteFooter } from '../../src/components/SiteFooter';
import { MobileBar } from '../../src/components/MobileBar';
import type { CopyData, SiteData } from '../../src/lib/types';

/**
 * Chrome(SiteHeader / SiteFooter / MobileBar) 컴포넌트 테스트.
 *
 * fixture 값은 브리프가 지정한 소스 원문 값(전화·카카오·태그라인)을 그대로 쓴다.
 * 그 외 문구는 짧은 더미 문자열이다.
 */

const site: SiteData = {
  brand_name: '핑크브로클린케어',
  brand_name_en: 'PINKBRO CLEANCARE',
  tagline: '깨끗한 공간, 더 나은 오늘',
  eyebrow: null,
  phone: '010-4348-8158',
  kakao_channel: 'http://pf.kakao.com/_gmcuG',
  region: '부울경',
  og_image_slot: null,
};

const copy: CopyData = {
  hero_headline: null,
  hero_lead: null,
  hero_pills: null,
  hero_visual_label: null,
  hero_visual_brand_message: null,
  hero_visual_body: null,
  hero_scope: null,
  about_heading: null,
  about_message: null,
  about_side_heading: null,
  about_perspectives: null,
  service_intro: null,
  service_intro_sub: null,
  service_detail_label: null,
  extra_box_heading: null,
  extra_box_body: null,
  package_intro: null,
  package_intro_sub: null,
  benefit_heading: null,
  benefit_sub: null,
  benefit_items: null,
  pricing_heading: null,
  pricing_sub: null,
  pricing_notice: null,
  pricing_notice_sub: null,
  pricing_field: null,
  pricing_flow_label: null,
  pricing_flow: null,
  estimator_heading: null,
  estimator_sub: null,
  estimator_summary_heading: null,
  estimator_summary_note: null,
  faq_intro: null,
  faq_intro_sub: null,
  projects_intro: null,
  projects_sub: null,
  projects_note: null,
  estimate_intro: null,
  estimate_note: null,
  estimate_checklist: null,
  estimate_panel_heading: null,
  estimate_panel_sub: null,
  estimate_panel_note: null,
  footer_text: '더미 푸터 문구',
  footer_brand_desc: '더미 브랜드 소개',
};

describe('telHref', () => {
  it('strips hyphens from the phone number', () => {
    expect(telHref('010-4348-8158')).toBe('tel:01043488158');
  });

  it('keeps digits only and prefixes tel:', () => {
    expect(telHref('0505-123-4567')).toBe('tel:05051234567');
  });

  it('falls back to # when the phone is missing', () => {
    expect(telHref(null)).toBe('#');
    expect(telHref('')).toBe('#');
  });
});

describe('SiteHeader', () => {
  it('renders the brand logo from the template asset', () => {
    render(<SiteHeader site={site} media={null} />);
    const logo = screen.getByRole('img', { name: /핑크브로클린케어/ });
    expect(logo.getAttribute('src')).toContain(
      '/api/templates/assets/pinkbro-cleancare?file=images/brand-logo.webp',
    );
  });

  it('nav links point at the source anchors', () => {
    render(<SiteHeader site={site} media={null} />);
    for (const id of ['about', 'service', 'package', 'pricing', 'projects', 'faq', 'estimate']) {
      expect(screen.getByRole('link', { name: id })).toHaveAttribute('href', `#${id}`);
    }
  });

  it('phone link strips hyphens for tel:', () => {
    render(<SiteHeader site={site} media={null} />);
    expect(screen.getByRole('link', { name: '010-4348-8158' })).toHaveAttribute(
      'href',
      'tel:01043488158',
    );
  });

  it('renders with a null site without crashing (nav anchors stay)', () => {
    render(<SiteHeader site={null} media={null} />);
    expect(screen.getByRole('link', { name: 'about' })).toHaveAttribute('href', '#about');
  });
});

describe('SiteFooter', () => {
  it('renders the brand tagline from props, not a literal', () => {
    render(<SiteFooter site={site} copy={copy} />);
    expect(screen.getByText('깨끗한 공간, 더 나은 오늘')).toBeInTheDocument();
  });

  it('renders the footer copy from props', () => {
    render(<SiteFooter site={site} copy={copy} />);
    expect(screen.getByText('더미 푸터 문구')).toBeInTheDocument();
  });

  it('renders the brand description from the copy domain (footer_brand_desc)', () => {
    render(<SiteFooter site={site} copy={copy} />);
    expect(screen.getByTestId('footer-brand-desc')).toHaveTextContent('더미 브랜드 소개');
  });

  it('omits the brand description when the copy domain has no value', () => {
    render(<SiteFooter site={site} copy={{ ...copy, footer_brand_desc: null }} />);
    expect(screen.queryByTestId('footer-brand-desc')).not.toBeInTheDocument();
    expect(screen.getByText('깨끗한 공간, 더 나은 오늘')).toBeInTheDocument();
  });

  it('renders the contact values from site props', () => {
    render(<SiteFooter site={site} copy={copy} />);
    expect(screen.getByRole('link', { name: '010-4348-8158' })).toHaveAttribute(
      'href',
      'tel:01043488158',
    );
    expect(screen.getByRole('link', { name: 'http://pf.kakao.com/_gmcuG' })).toHaveAttribute(
      'href',
      'http://pf.kakao.com/_gmcuG',
    );
    expect(screen.getByText('부울경')).toBeInTheDocument();
  });

  it('renders with null site and null copy without crashing', () => {
    render(<SiteFooter site={null} copy={null} />);
    expect(screen.queryByText('깨끗한 공간, 더 나은 오늘')).not.toBeInTheDocument();
  });
});

describe('MobileBar', () => {
  it('exposes phone, estimate and kakao actions', () => {
    render(<MobileBar site={site} />);
    expect(screen.getByRole('link', { name: /전화상담/ })).toHaveAttribute('href', 'tel:01043488158');
    expect(screen.getByRole('link', { name: /카카오문의/ })).toHaveAttribute(
      'href',
      site.kakao_channel,
    );
    expect(screen.getByRole('link', { name: /간편견적/ })).toHaveAttribute('href', '#estimate');
  });

  it('renders with a null site without crashing', () => {
    render(<MobileBar site={null} />);
    expect(screen.getByRole('link', { name: /간편견적/ })).toHaveAttribute('href', '#estimate');
  });
});