import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CaseGallery } from '../../src/components/CaseGallery';
import type { CaseItem } from '../../src/lib/types';

describe('CaseGallery', () => {
  it('renders a skeleton when items is null', () => {
    render(<CaseGallery intro={null} note={null} sub={null} media={null}
        items={null} />);
    expect(screen.getByTestId('cases-skeleton')).toBeInTheDocument();
  });

  it('renders no cover img when no photo is uploaded — the thumb shows its own gradient (source body.html:379)', () => {
    const items = [1, 2, 3, 4].map(n => ({
      title: `실제 작업사례 0${n}`, summary: `설명 ${n}`, blog_url: '',
      cover: { url: null, alt: null },
    }));
    render(<CaseGallery intro="소개" note="주의" sub={null} media={null}
        items={items} />);

    expect(screen.getAllByTestId('case-card')).toHaveLength(4);
    // 슬롯이 비면 사진을 렌더하지 않는다 — 그라디언트는 .pb-project-thumb 의 CSS 배경이다.
    expect(screen.queryAllByTestId('case-cover')).toHaveLength(0);
    expect(document.querySelectorAll('.pb-project-thumb img')).toHaveLength(0);
    // Case 0N 라벨은 사진 유무와 무관하게 항상 남는다.
    expect([...document.querySelectorAll('.pb-project-index')].map(el => el.textContent)).toEqual([
      'Case 01', 'Case 02', 'Case 03', 'Case 04',
    ]);
  });

  it('lets the uploaded slot url win over the empty slot', () => {
    const items: CaseItem[] = [{ title: 'T', summary: 'S', blog_url: '',
      cover: { url: null, alt: null } }];
    const { unmount } = render(
      <CaseGallery intro="i" note="n" sub={null}
        media={{ case_1: { url: '/uploads/case1.webp', alt: '현장 1' } }} items={items} />,
    );
    const cover = screen.getByTestId('case-cover');
    expect(cover).toHaveAttribute('src', '/uploads/case1.webp');
    expect(cover).toHaveAttribute('alt', '현장 1');
    unmount();

    // 항목이 서버에서 해석해 온 cover 도 업로드다 — 슬롯 맵이 아직 안 왔어도 이긴다.
    render(
      <CaseGallery intro="i" note="n" sub={null} media={null}
        items={[{ title: 'T', summary: 'S', blog_url: '',
          cover: { url: '/api/files/c.webp', alt: '업로드 커버' } }]} />,
    );
    expect(screen.getByTestId('case-cover')).toHaveAttribute('src', '/api/files/c.webp');
    expect(screen.getByTestId('case-cover')).toHaveAttribute('alt', '업로드 커버');
  });

  it('renders no img for every card whose slot has no photo — the gradient is css on .pb-project-thumb', () => {
    // 슬롯 업로드가 없으면 슬롯 함수는 null 을 돌려준다 — 그것이 정상 경로다.
    const items = [1, 2, 3, 4, 5].map(n => ({
      title: `실제 작업사례 0${n}`, summary: `설명 ${n}`, blog_url: '',
      cover: { url: null, alt: null },
    }));
    render(<CaseGallery intro="소개" note="주의" sub={null} media={null} items={items} />);

    expect(screen.queryAllByTestId('case-cover')).toHaveLength(0);
    expect(document.querySelectorAll('.pb-project-thumb')).toHaveLength(5);
    expect(document.querySelectorAll('.pb-project-index')).toHaveLength(5);
  });

  it('honours an item-level cover_slot over the card position', () => {
    // 순서가 바뀐 항목 — 항목이 슬롯 키를 들고 오면 그 키가 순번을 이긴다.
    const items: CaseItem[] = [1, 2].map(n => ({
      title: `T${n}`, summary: 'S', blog_url: '',
      cover: { url: null, alt: null }, cover_slot: `case_${n + 2}`,
    }));
    render(<CaseGallery intro="i" note="n" sub={null}
      media={{
        case_3: { url: '/uploads/case3.webp', alt: '현장 3' },
        case_4: { url: '/uploads/case4.webp', alt: '현장 4' },
      }}
      items={items} />);

    expect(screen.getAllByTestId('case-cover').map(img => img.getAttribute('src'))).toEqual([
      '/uploads/case3.webp',
      '/uploads/case4.webp',
    ]);
  });

  it('renders the uploaded cover image when a slot is set', () => {
    const items: CaseItem[] = [{ title: 'T', summary: 'S', blog_url: 'https://blog.naver.com/x',
      cover: { url: '/c.webp', alt: '현장' } }];
    render(<CaseGallery intro="i" note="n" sub={null} media={null}
        items={items} />);
    expect(screen.getByRole('img', { name: '현장' })).toHaveAttribute('src', '/c.webp');
  });

  it('does not render a link when blog_url is empty', () => {
    const items: CaseItem[] = [{ title: 'T', summary: 'S', blog_url: '', cover: { url: null, alt: null } }];
    render(<CaseGallery intro="i" note="n" sub={null} media={null}
        items={items} />);
    const card = screen.getByTestId('case-card');
    expect(card.tagName).not.toBe('A');
    expect(card).toHaveAttribute('aria-disabled', 'true');
  });

  it('renders an anchor with the blog url when present', () => {
    const items: CaseItem[] = [{ title: 'T', summary: 'S', blog_url: 'https://blog.naver.com/x',
      cover: { url: null, alt: null } }];
    render(<CaseGallery intro="i" note="n" sub={null} media={null}
        items={items} />);
    expect(screen.getByTestId('case-card')).toHaveAttribute('href', 'https://blog.naver.com/x');
  });

  it('renders an empty state when items is an empty array', () => {
    render(<CaseGallery intro={null} note={null} sub={null} media={null}
        items={[]} />);
    expect(screen.getByTestId('cases-empty')).toBeInTheDocument();
  });

  it('renders the section sub copy from the copy domain (projects_sub)', () => {
    render(
      <CaseGallery
        intro={null}
        sub="핑크브로클린케어가 직접 진행한 현장의 작업 내용과 전후 과정은 네이버 블로그에서 자세히 확인할 수 있습니다."
        note={null}
        media={null}
        items={[{ title: 'T', summary: 'S', blog_url: '', cover: { url: null, alt: null } }]}
      />,
    );
    expect(screen.getByTestId('projects-sub')).toHaveTextContent(
      '네이버 블로그에서 자세히 확인할 수 있습니다',
    );
  });

  it('omits the section sub copy when the key is null', () => {
    render(
      <CaseGallery intro="i" sub={null} note={null} media={null}
        items={[{ title: 'T', summary: 'S', blog_url: '', cover: { url: null, alt: null } }]} />,
    );
    expect(screen.queryByTestId('projects-sub')).not.toBeInTheDocument();
  });

  it('renders the two-column section head: intro on the left, sub on the right (source .section-head)', () => {
    render(
      <CaseGallery intro="실제 현장에서 확인해 보세요.\n최근 작업 사례입니다."
        sub="핑크브로클린케어가 직접 진행한 현장의 작업 내용입니다." note={null} media={null} items={[]} />,
    );
    const head = document.querySelector('.pb-projects__head');
    expect(head).not.toBeNull();
    // sub 는 소개 문구 아래(왼쪽 컬럼 내부)가 아니라 헤더의 직계 오른쪽 컬럼이다.
    expect(head).toContainElement(screen.getByTestId('projects-sub'));
    expect(head!.querySelector('.pb-projects__copy')).toContainElement(
      screen.getByRole('heading', { level: 2 }),
    );
    expect(screen.getByRole('heading', { level: 2 }).nextElementSibling).toBeNull();
  });

  it('renders the eyebrow above the intro only when a value is provided', () => {
    const { rerender } = render(
      <CaseGallery intro="소개" sub={null} note={null} media={null} items={[]} eyebrow="Recent Projects" />,
    );
    expect(screen.getByTestId('projects-eyebrow')).toHaveTextContent('Recent Projects');

    // 모듈에 copy 키가 없는 동안은 배선이 값을 주지 않는다 — 눈금 없이 렌더.
    rerender(<CaseGallery intro="소개" sub={null} note={null} media={null} items={[]} />);
    expect(screen.queryByTestId('projects-eyebrow')).not.toBeInTheDocument();
  });

  it('renders the card kicker on every card when a value is provided, and omits it otherwise', () => {
    const items: CaseItem[] = [1, 2, 3, 4].map(n => ({
      title: `실제 작업사례 0${n}`, summary: 'S', blog_url: '', cover: { url: null, alt: null },
    }));
    const { rerender } = render(
      <CaseGallery intro={null} sub={null} note={null} media={null}
        items={items} cardKicker="PINKBRO PROJECT" />,
    );
    expect(screen.getAllByTestId('case-card-kicker')).toHaveLength(4);
    expect(screen.getAllByTestId('case-card-kicker')[0]).toHaveTextContent('PINKBRO PROJECT');

    // copy 키(projects_card_kicker)가 없으면 킥커를 만들지 않는다 — 리터럴 대체 금지
    rerender(<CaseGallery intro={null} sub={null} note={null} media={null} items={items} />);
    expect(screen.queryByTestId('case-card-kicker')).not.toBeInTheDocument();
  });

  it('renders the card link label whenever a label value exists — the source shows the label even without a url (body.html:379)', () => {
    const linked: CaseItem[] = [{ title: 'T', summary: 'S', blog_url: 'https://blog.naver.com/x',
      cover: { url: null, alt: null } }];
    const { rerender } = render(
      <CaseGallery intro={null} sub={null} note={null} media={null}
        items={linked} linkLabel="작업사례 자세히 보기" />,
    );
    expect(screen.getByTestId('case-card-link')).toHaveTextContent('작업사례 자세히 보기');

    // 링크 문구(copy 키)가 없으면 링크 라벨을 만들지 않는다.
    rerender(<CaseGallery intro={null} sub={null} note={null} media={null} items={linked} />);
    expect(screen.queryByTestId('case-card-link')).not.toBeInTheDocument();

    // blog_url 이 비어도 라벨은 항상 렌더한다 — 원문의 시각 계약이다.
    const unlinked: CaseItem[] = [{ title: 'T', summary: 'S', blog_url: '', cover: { url: null, alt: null } }];
    rerender(<CaseGallery intro={null} sub={null} note={null} media={null}
        items={unlinked} linkLabel="작업사례 자세히 보기" />);
    expect(screen.getByTestId('case-card-link')).toHaveTextContent('작업사례 자세히 보기');
    // 다만 URL 이 없으면 카드 자체는 비링크 <div> 로 남는다 (href="#" 최상단 점프 결함 재현 금지).
    const card = screen.getByTestId('case-card');
    expect(card.tagName).not.toBe('A');
    expect(card).toHaveAttribute('aria-disabled', 'true');
  });
});