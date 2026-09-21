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
  hero_visual_message_label: null,
  hero_visual_brand_message: null,
  hero_visual_body: null,
  hero_scope: null,
  hero_cta_primary: null,
  hero_cta_secondary: null,
  about_heading: null,
  about_message: null,
  about_side_heading: null,
  about_stage_eyebrow: null,
  about_side_eyebrow: null,
  about_perspectives: null,
  service_eyebrow: null,
  service_intro: null,
  service_intro_sub: null,
  service_detail_label: null,
  extra_box_heading: null,
  extra_box_body: null,
  extra_box_cta: null,
  package_stage_eyebrow: null,
  package_intro: null,
  package_intro_sub: null,
  package_a_label: null,
  package_b_label: null,
  package_c_label: null,
  package_a_note: null,
  package_a_note_sub: null,
  package_b_note: null,
  package_b_note_sub: null,
  package_c_note: null,
  package_c_note_sub: null,
  benefit_eyebrow: null,
  benefit_heading: null,
  benefit_sub: null,
  benefit_items: null,
  pricing_eyebrow: null,
  pricing_heading: null,
  pricing_sub: null,
  pricing_notice: null,
  pricing_notice_label: null,
  pricing_notice_sub: null,
  pricing_field: null,
  pricing_flow_label: null,
  pricing_flow: null,
  estimator_eyebrow: null,
  estimator_heading: null,
  estimator_sub: null,
  estimator_summary_heading: null,
  estimator_summary_total_label: null,
  estimator_summary_note: null,
  estimator_air_label: null,
  estimator_row_count: null,
  estimator_row_base: null,
  estimator_row_discount: null,
  estimator_row_discount_amount: null,
  estimator_cta_submit: null,
  estimator_cta_kakao: null,
  faq_eyebrow: null,
  faq_intro: null,
  faq_intro_sub: null,
  projects_eyebrow: null,
  projects_card_kicker: null,
  projects_link_label: null,
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
  header_cta: '간편견적 문의',
  mobile_cta_estimate: '간편견적',
  mobile_cta_phone: '전화상담',
  mobile_cta_kakao: '카카오문의',
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
    render(<SiteHeader site={site} media={null} copy={copy} />);
    const logo = screen.getByRole('img', { name: /핑크브로클린케어/ });
    expect(logo.getAttribute('src')).toContain(
      '/api/templates/assets/pinkbro-cleancare?file=images/brand-logo.webp',
    );
  });

  it('nav links point at the source anchors', () => {
    render(<SiteHeader site={site} media={null} copy={copy} />);
    for (const id of ['about', 'service', 'package', 'pricing', 'projects', 'faq', 'estimate']) {
      expect(screen.getByRole('link', { name: id })).toHaveAttribute('href', `#${id}`);
    }
  });

  it('phone link strips hyphens for tel:', () => {
    render(<SiteHeader site={site} media={null} copy={copy} />);
    expect(screen.getByRole('link', { name: '010-4348-8158' })).toHaveAttribute(
      'href',
      'tel:01043488158',
    );
  });

  it('renders with a null site without crashing (nav anchors stay)', () => {
    render(<SiteHeader site={null} media={null} copy={null} />);
    expect(screen.getByRole('link', { name: 'about' })).toHaveAttribute('href', '#about');
  });

  it('takes both CTAs from the copy domain (header_cta / mobile_cta_estimate)', () => {
    render(<SiteHeader site={site} media={null} copy={copy} />);
    expect(screen.getByTestId('header-cta')).toHaveTextContent('간편견적 문의');
    expect(screen.getByTestId('header-cta')).toHaveAttribute('href', '#estimate');
    expect(screen.getByTestId('header-mobile-cta')).toHaveTextContent('간편견적');
    expect(screen.getByTestId('header-mobile-cta')).toHaveAttribute('href', '#estimate');
  });

  it('omits a CTA whose copy key is null — 리터럴로 대체하지 않는다', () => {
    render(
      <SiteHeader
        site={site}
        media={null}
        copy={{ ...copy, header_cta: null, mobile_cta_estimate: null }}
      />,
    );
    expect(screen.queryByTestId('header-cta')).not.toBeInTheDocument();
    expect(screen.queryByTestId('header-mobile-cta')).not.toBeInTheDocument();
    // 헤더 자체와 전화 링크는 남는다
    expect(screen.getByTestId('pb-header')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '010-4348-8158' })).toBeInTheDocument();
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
    render(<MobileBar site={site} copy={copy} />);
    expect(screen.getByRole('link', { name: /전화상담/ })).toHaveAttribute('href', 'tel:01043488158');
    expect(screen.getByRole('link', { name: /카카오문의/ })).toHaveAttribute(
      'href',
      site.kakao_channel,
    );
    expect(screen.getByRole('link', { name: /간편견적/ })).toHaveAttribute('href', '#estimate');
  });

  it('renders with a null site without crashing (labels still from copy)', () => {
    render(<MobileBar site={null} copy={copy} />);
    expect(screen.getByRole('link', { name: /간편견적/ })).toHaveAttribute('href', '#estimate');
  });

  it('takes every label from the copy domain (mobile_cta_*)', () => {
    render(<MobileBar site={site} copy={copy} />);
    expect(screen.getByRole('link', { name: '전화상담' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '간편견적' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '카카오문의' })).toBeInTheDocument();
  });

  it('omits each action whose copy key is null — 리터럴로 대체하지 않는다', () => {
    render(
      <MobileBar
        site={site}
        copy={{ ...copy, mobile_cta_phone: null, mobile_cta_estimate: null, mobile_cta_kakao: null }}
      />,
    );
    // 카카오는 채널이 있어도 라벨이 없으면 렌더하지 않는다
    expect(screen.queryByRole('link', { name: '전화상담' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: '간편견적' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: '카카오문의' })).not.toBeInTheDocument();
    expect(screen.getByTestId('pb-mobile-bar')).toBeInTheDocument();
  });
});