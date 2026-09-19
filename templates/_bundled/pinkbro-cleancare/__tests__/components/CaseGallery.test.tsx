import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CaseGallery } from '../../src/components/CaseGallery';
import type { CaseItem } from '../../src/lib/types';

describe('CaseGallery', () => {
  it('renders a skeleton when items is null', () => {
    render(<CaseGallery intro={null} note={null} sub={null} items={null} />);
    expect(screen.getByTestId('cases-skeleton')).toBeInTheDocument();
  });

  it('renders four cards with the css gradient fallback when no cover is uploaded', () => {
    const items = [1, 2, 3, 4].map(n => ({
      title: `실제 작업사례 0${n}`, summary: `설명 ${n}`, blog_url: '',
      cover: { url: null, alt: null },
    }));
    render(<CaseGallery intro="소개" note="주의" sub={null} items={items} />);

    expect(screen.getAllByTestId('case-card')).toHaveLength(4);
    expect(screen.getAllByTestId('case-cover-fallback')).toHaveLength(4);
  });

  it('renders the uploaded cover image when a slot is set', () => {
    const items: CaseItem[] = [{ title: 'T', summary: 'S', blog_url: 'https://blog.naver.com/x',
      cover: { url: '/c.webp', alt: '현장' } }];
    render(<CaseGallery intro="i" note="n" sub={null} items={items} />);
    expect(screen.getByRole('img', { name: '현장' })).toHaveAttribute('src', '/c.webp');
  });

  it('does not render a link when blog_url is empty', () => {
    const items: CaseItem[] = [{ title: 'T', summary: 'S', blog_url: '', cover: { url: null, alt: null } }];
    render(<CaseGallery intro="i" note="n" sub={null} items={items} />);
    const card = screen.getByTestId('case-card');
    expect(card.tagName).not.toBe('A');
    expect(card).toHaveAttribute('aria-disabled', 'true');
  });

  it('renders an anchor with the blog url when present', () => {
    const items: CaseItem[] = [{ title: 'T', summary: 'S', blog_url: 'https://blog.naver.com/x',
      cover: { url: null, alt: null } }];
    render(<CaseGallery intro="i" note="n" sub={null} items={items} />);
    expect(screen.getByTestId('case-card')).toHaveAttribute('href', 'https://blog.naver.com/x');
  });

  it('renders an empty state when items is an empty array', () => {
    render(<CaseGallery intro={null} note={null} sub={null} items={[]} />);
    expect(screen.getByTestId('cases-empty')).toBeInTheDocument();
  });

  it('renders the section sub copy from the copy domain (projects_sub)', () => {
    render(
      <CaseGallery
        intro={null}
        sub="핑크브로클린케어가 직접 진행한 현장의 작업 내용과 전후 과정은 네이버 블로그에서 자세히 확인할 수 있습니다."
        note={null}
        items={[{ title: 'T', summary: 'S', blog_url: '', cover: { url: null, alt: null } }]}
      />,
    );
    expect(screen.getByTestId('projects-sub')).toHaveTextContent(
      '네이버 블로그에서 자세히 확인할 수 있습니다',
    );
  });

  it('omits the section sub copy when the key is null', () => {
    render(
      <CaseGallery intro="i" sub={null} note={null}
        items={[{ title: 'T', summary: 'S', blog_url: '', cover: { url: null, alt: null } }]} />,
    );
    expect(screen.queryByTestId('projects-sub')).not.toBeInTheDocument();
  });
});