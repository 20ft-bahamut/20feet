import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CaseGallery } from '../../src/components/CaseGallery';
import type { CaseItem } from '../../src/lib/types';

describe('CaseGallery', () => {
  it('renders a skeleton when items is null', () => {
    render(<CaseGallery intro={null} note={null} items={null} />);
    expect(screen.getByTestId('cases-skeleton')).toBeInTheDocument();
  });

  it('renders four cards with the css gradient fallback when no cover is uploaded', () => {
    const items = [1, 2, 3, 4].map(n => ({
      title: `실제 작업사례 0${n}`, summary: `설명 ${n}`, blog_url: '',
      cover: { url: null, alt: null },
    }));
    render(<CaseGallery intro="소개" note="주의" items={items} />);

    expect(screen.getAllByTestId('case-card')).toHaveLength(4);
    expect(screen.getAllByTestId('case-cover-fallback')).toHaveLength(4);
  });

  it('renders the uploaded cover image when a slot is set', () => {
    const items: CaseItem[] = [{ title: 'T', summary: 'S', blog_url: 'https://blog.naver.com/x',
      cover: { url: '/c.webp', alt: '현장' } }];
    render(<CaseGallery intro="i" note="n" items={items} />);
    expect(screen.getByRole('img', { name: '현장' })).toHaveAttribute('src', '/c.webp');
  });

  it('does not render a link when blog_url is empty', () => {
    const items: CaseItem[] = [{ title: 'T', summary: 'S', blog_url: '', cover: { url: null, alt: null } }];
    render(<CaseGallery intro="i" note="n" items={items} />);
    const card = screen.getByTestId('case-card');
    expect(card.tagName).not.toBe('A');
    expect(card).toHaveAttribute('aria-disabled', 'true');
  });

  it('renders an anchor with the blog url when present', () => {
    const items: CaseItem[] = [{ title: 'T', summary: 'S', blog_url: 'https://blog.naver.com/x',
      cover: { url: null, alt: null } }];
    render(<CaseGallery intro="i" note="n" items={items} />);
    expect(screen.getByTestId('case-card')).toHaveAttribute('href', 'https://blog.naver.com/x');
  });

  it('renders an empty state when items is an empty array', () => {
    render(<CaseGallery intro={null} note={null} items={[]} />);
    expect(screen.getByTestId('cases-empty')).toBeInTheDocument();
  });
});