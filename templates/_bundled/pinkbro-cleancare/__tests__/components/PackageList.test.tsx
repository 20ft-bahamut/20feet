import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PackageList } from '../../src/components/PackageList';

const css = (): string =>
  readFileSync(join(__dirname, '..', '..', 'src', 'styles', 'PackageList.css'), 'utf8');

const items = [
  {
    title: 'A', summary: 'sa', includes: ['i1', 'i2'],
    base_total: '400,000원', price: '380,000원~', discount_rate: 5, is_featured: false,
  },
  {
    title: 'B', summary: 'sb', includes: ['i3'],
    base_total: '900,000원', price: '810,000원~', discount_rate: 10, is_featured: true,
  },
];

describe('PackageList', () => {
  it('renders a skeleton when items is null', () => {
    render(<PackageList intro={null} introSub={null} benefitHeading={null} benefitSub={null} benefitItems={null} media={null} items={null} />);
    expect(screen.getByTestId('packages-skeleton')).toBeInTheDocument();
  });

  it('renders an empty state when items is an empty array', () => {
    render(<PackageList intro="소개" introSub={null} benefitHeading={null} benefitSub={null} benefitItems={null} media={null} items={[]} />);
    expect(screen.getByTestId('packages-empty')).toBeInTheDocument();
  });

  it('renders one card per package with price, base_total, suffix and old price', () => {
    render(<PackageList intro="소개" introSub={null} benefitHeading={null} benefitSub={null} benefitItems={null} media={null} items={items} />);

    expect(screen.getAllByTestId('package-card')).toHaveLength(2);
    // 원문 .pkg-total — 금액 본문(42px)과 접미사 `원~`(16px small)을 나눠 렌더한다
    expect(screen.getByText('380,000')).toBeInTheDocument();
    expect(screen.getAllByTestId('package-price-suffix')[0]).toHaveTextContent('원~');
    expect(screen.getByText('400,000원')).toBeInTheDocument();
    expect(screen.getByText('810,000')).toBeInTheDocument();
  });

  it('renders the section intro as a stage heading (원문 .package-copy .h2)', () => {
    render(
      <PackageList
        intro={'매장에 필요한 것만 골라\n더 효율적으로 관리하세요.'}
        introSub={null}
        benefitHeading={null}
        benefitSub={null}
        benefitItems={null}
        media={null}
        items={items}
      />,
    );
    expect(screen.getByRole('heading', { level: 2, name: /매장에 필요한 것만 골라/ })).toBeInTheDocument();
    expect(screen.getByTestId('packages-intro').tagName).toBe('H2');
  });

  it('keeps the price intact when it has no 원 suffix to split', () => {
    render(
      <PackageList
        intro={null}
        introSub={null}
        benefitHeading={null}
        benefitSub={null}
        benefitItems={null}
        media={null}
        items={[{ ...items[0], price: '380,000' }]}
      />,
    );
    expect(screen.getByText('380,000')).toBeInTheDocument();
    expect(screen.queryByTestId('package-price-suffix')).not.toBeInTheDocument();
  });

  it('renders the includes array as a list', () => {
    render(<PackageList intro="소개" introSub={null} benefitHeading={null} benefitSub={null} benefitItems={null} media={null} items={items} />);
    expect(screen.getByText('i1')).toBeInTheDocument();
    expect(screen.getByText('i2')).toBeInTheDocument();
    expect(screen.getAllByRole('list')).toHaveLength(2);
  });

  it('marks the featured package with an emphasis class', () => {
    render(<PackageList intro="소개" introSub={null} benefitHeading={null} benefitSub={null} benefitItems={null} media={null} items={items} />);
    const cards = screen.getAllByTestId('package-card');
    expect(cards[0]).not.toHaveClass('pb-pkg-card--featured');
    expect(cards[1]).toHaveClass('pb-pkg-card--featured');
  });

  it('renders the section sub copy from the copy domain (package_intro_sub)', () => {
    render(
      <PackageList
        intro="도입 문구"
        introSub="첫인상, 주방, 공조환경까지 자주 선택하는 조합을 패키지 기준으로 정리했습니다."
        benefitHeading={null}
        benefitSub={null}
        benefitItems={null}
        media={null}
        items={items}
      />,
    );
    expect(screen.getByTestId('packages-intro-sub')).toHaveTextContent(
      '패키지 기준으로 정리했습니다',
    );
  });

  it('renders the multi-service benefit table from benefit_* copy', () => {
    render(
      <PackageList
        intro="도입 문구"
        introSub={null}
        benefitHeading={'같은 매장, 같은 일정이라면\n함께 맡길수록 더 효율적입니다.'}
        benefitSub="서비스 종류 기준으로 항목을 계산합니다."
        benefitItems={[
          { condition: '1개 항목', amount_label: '정상가' },
          { condition: '2개 항목', amount_label: '3%' },
          { condition: '3~4개 항목', amount_label: '5%' },
          { condition: '5개 이상', amount_label: '10%' },
        ]}
        media={null}
        items={items}
      />,
    );

    expect(screen.getByTestId('benefit-box')).toBeInTheDocument();
    expect(screen.getByTestId('benefit-heading')).toHaveTextContent('함께 맡길수록 더 효율적입니다.');
    expect(screen.getByTestId('benefit-sub')).toHaveTextContent('서비스 종류 기준으로');
    // 원문 benefit-grid 는 4행(1개 항목 정상가 포함)이다
    const rows = screen.getAllByTestId('benefit-item');
    expect(rows).toHaveLength(4);
    expect(rows[0]).toHaveTextContent('1개 항목');
    expect(rows[0]).toHaveTextContent('정상가');
    expect(rows[3]).toHaveTextContent('5개 이상');
    expect(rows[3]).toHaveTextContent('10%');
  });

  it('omits the benefit box when no benefit copy and no rows are given', () => {
    render(
      <PackageList intro="소개" introSub={null} benefitHeading={null} benefitSub={null}
        benefitItems={null} media={null} items={items} />,
    );
    expect(screen.queryByTestId('benefit-box')).not.toBeInTheDocument();
  });

  it('renders the stage eyebrow from copy (package_stage_eyebrow)', () => {
    const { unmount } = render(
      <PackageList
        stageEyebrow="Pinkbro F&B Package"
        intro="도입 문구"
        introSub={null}
        benefitHeading={null}
        benefitSub={null}
        benefitItems={null}
        media={null}
        items={items}
      />,
    );
    expect(screen.getByTestId('package-stage-eyebrow')).toHaveTextContent('Pinkbro F&B Package');
    expect(screen.getByTestId('package-stage-eyebrow').className).toContain(
      'pb-package-copy-eyebrow',
    );
    unmount();

    render(
      <PackageList
        intro="도입 문구"
        introSub={null}
        benefitHeading={null}
        benefitSub={null}
        benefitItems={null}
        media={null}
        items={items}
      />,
    );
    expect(screen.queryByTestId('package-stage-eyebrow')).not.toBeInTheDocument();
  });

  it('renders each card label and note from copy, in card order A → B → C', () => {
    // 주의: 아래 fixture 의 두 번째 카드 금액(900,000원)은 원문 C 패키지 값이다.
    // 이 테스트가 검증하는 것은 금액이 아니라 **copy 키 → 카드 index 대응**이다.
    render(
      <PackageList
        intro="도입 문구"
        introSub={null}
        labelA="A Package"
        labelB="B Package"
        labelC="C Package"
        noteA="기본가 합계 400,000원"
        noteASub="3개 항목 동시작업 5% 적용"
        noteB="기본가 합계 650,000원"
        noteBSub="3개 항목 동시작업 5% 적용"
        noteC="기본가 합계 900,000원"
        noteCSub="5개 항목 동시작업 10% 적용"
        benefitHeading={null}
        benefitSub={null}
        benefitItems={null}
        media={null}
        items={items}
      />,
    );

    const labels = screen.getAllByTestId('package-label');
    expect(labels).toHaveLength(2);
    expect(labels[0]).toHaveTextContent('A Package');
    expect(labels[0].className).toContain('pb-pkg-label');
    expect(labels[1]).toHaveTextContent('B Package');

    // 원문 .pkg-note 는 `기본가 합계 …<br>… 동시작업 … 적용` 한 줄이다
    const notes = screen.getAllByTestId('package-note');
    expect(notes).toHaveLength(2);
    expect(notes[0].textContent).toBe('기본가 합계 400,000원3개 항목 동시작업 5% 적용');
    expect(notes[0].querySelector('br')).not.toBeNull();
    expect(notes[1].textContent).toBe('기본가 합계 650,000원3개 항목 동시작업 5% 적용');

    // 라벨은 카드의 h3 바로 위에 온다 (원문 .pkg-label → h3)
    expect(
      labels[0].compareDocumentPosition(labels[0].parentElement!.querySelector('h3')!) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it('renders only the note half that exists and omits both when the keys are null', () => {
    const { unmount } = render(
      <PackageList
        intro={null}
        introSub={null}
        noteA="기본가 합계 400,000원"
        benefitHeading={null}
        benefitSub={null}
        benefitItems={null}
        media={null}
        items={[items[0]]}
      />,
    );
    const note = screen.getByTestId('package-note');
    expect(note.textContent).toBe('기본가 합계 400,000원');
    expect(note.querySelector('br')).toBeNull();
    unmount();

    render(
      <PackageList
        intro={null}
        introSub={null}
        benefitHeading={null}
        benefitSub={null}
        benefitItems={null}
        media={null}
        items={items}
      />,
    );
    expect(screen.queryByTestId('package-note')).not.toBeInTheDocument();
    expect(screen.queryByTestId('package-label')).not.toBeInTheDocument();
  });

  it('renders the benefit eyebrow from copy (benefit_eyebrow)', () => {
    const { unmount } = render(
      <PackageList
        intro={null}
        introSub={null}
        benefitEyebrow="Multi-Service Benefit"
        benefitHeading="함께 맡길수록 더 효율적입니다."
        benefitSub={null}
        benefitItems={[{ condition: '1개 항목', amount_label: '정상가' }]}
        media={null}
        items={items}
      />,
    );
    const eyebrow = screen.getByTestId('benefit-eyebrow');
    expect(eyebrow).toHaveTextContent('Multi-Service Benefit');
    expect(eyebrow.className).toContain('pb-benefit-eyebrow');
    expect(
      eyebrow.compareDocumentPosition(screen.getByTestId('benefit-heading')) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    unmount();

    render(
      <PackageList
        intro={null}
        introSub={null}
        benefitHeading="함께 맡길수록 더 효율적입니다."
        benefitSub={null}
        benefitItems={[{ condition: '1개 항목', amount_label: '정상가' }]}
        media={null}
        items={items}
      />,
    );
    expect(screen.queryByTestId('benefit-eyebrow')).not.toBeInTheDocument();
  });

  it('renders the stage image from the package_stage media slot when the admin uploaded one', () => {
    render(
      <PackageList intro="소개" introSub={null} benefitHeading={null} benefitSub={null}
        benefitItems={null} items={items}
        media={{ package_stage: { url: '/uploads/package.webp', alt: '패키지' } }} />,
    );

    const img = screen.getByTestId('package-stage-media');
    expect(img.tagName).toBe('IMG');
    expect(img).toHaveAttribute('src', '/uploads/package.webp');
    expect(img).toHaveAttribute('alt', '패키지');
    expect(screen.queryByTestId('package-stage-fallback')).not.toBeInTheDocument();
  });

  it('renders the bundled placeholder photo when package_stage is empty or media is null', () => {
    // SLOT_PHOTO.package_stage — 원본 페이지의 패키지 스테이지 사진
    const placeholder =
      '/api/templates/assets/pinkbro-cleancare?file=images/package-stage.webp';

    const { unmount } = render(
      <PackageList intro="소개" introSub={null} benefitHeading={null} benefitSub={null}
        benefitItems={null} items={items}
        media={{ package_stage: { url: null, alt: null } }} />,
    );
    expect(screen.getByTestId('package-stage-media')).toHaveAttribute('src', placeholder);
    expect(screen.queryByTestId('package-stage-fallback')).not.toBeInTheDocument();
    unmount();

    render(
      <PackageList intro="소개" introSub={null} benefitHeading={null} benefitSub={null}
        benefitItems={null} items={items} media={null} />,
    );
    expect(screen.getByTestId('package-stage-media')).toHaveAttribute('src', placeholder);
    expect(screen.queryByTestId('package-stage-fallback')).not.toBeInTheDocument();
  });

  it('keeps the source scrim on .pb-package-stage::before — 스톡 URL 만 빠진 원문 그라디언트', () => {
    const flat = css().replace(/\s+/g, ' ');

    // 원문 source/styles.css 156~158행의 값 그대로 (그 선언에서 Unsplash URL 만 제거).
    expect(flat).toContain('.pb-package-stage::before');
    for (const stop of [
      'rgba(10, 11, 15, 0.84) 0%',
      'rgba(10, 11, 15, 0.66) 44%',
      'rgba(10, 11, 15, 0.24) 100%',
    ]) {
      expect(flat).toContain(stop);
    }
    expect(flat).toMatch(/\.pb-package-stage::before { [^}]*z-index: 1;/);

    // 스크림은 사진 위(media z-index 0), 카피 아래(2) — 이미지가 무엇이든 대비는 같다.
    expect(flat).toMatch(/\.pb-package-stage-media { [^}]*z-index: 0;/);
    expect(flat).toMatch(/\.pb-package-copy { [^}]*z-index: 2;/);

    // 스톡 URL 은 되살아나지 않는다
    expect(flat).not.toMatch(/unsplash\.com/);
  });

  it('keeps the source section padding on the package root (원문 section { padding:110px 0 })', () => {
    const source = css();
    // 원문 source/styles.css 63행 — 다른 섹션과 같은 규칙. 이 섹션만 빠져 높이가 220px 짧았다.
    expect(source).toMatch(/\.pb-packages\s*{\s*padding:\s*110px 0;\s*}/);
    // 원문 310행 @media (max-width:720px) { section { padding:82px 0 } }
    expect(source).toMatch(
      /@media \(max-width: 720px\)[\s\S]*?\.pb-packages\s*{\s*padding:\s*82px 0;\s*}/,
    );
  });

  it('puts the stage, the grid and the benefit box inside the template container (pb-wrap)', () => {
    // 원문 #package > .wrap 안에 .package-stage / .package-grid / .benefit-box 가 모두 들어간다
    // (body.html 171~243행). 컨테이너가 없으면 셋 다 뷰포트 폭(1440)으로 퍼져
    // 원문(1280)과 어긋나고, 스테이지 오른쪽이 빈 다크 영역으로 남는다.
    render(
      <PackageList
        intro="도입 문구"
        introSub={null}
        benefitHeading="혜택"
        benefitSub={null}
        benefitItems={[{ condition: '1개 항목', amount_label: '정상가' }]}
        media={null}
        items={items}
      />,
    );

    for (const id of ['package-stage', 'package-grid', 'benefit-box']) {
      const node =
        id === 'package-grid'
          ? screen.getAllByTestId('package-card')[0].parentElement
          : screen.getByTestId(id);
      expect(node, id).not.toBeNull();
      expect(node!.closest('.pb-wrap'), id).not.toBeNull();
      // 컨테이너는 섹션 루트 바로 아래 하나뿐이다
      expect(node!.closest('.pb-packages')!.querySelectorAll(':scope > .pb-wrap')).toHaveLength(1);
    }
  });

  it('gives the loading skeleton and the empty state the same container (폭이 튀지 않는다)', () => {
    const { unmount } = render(
      <PackageList intro={null} introSub={null} benefitHeading={null} benefitSub={null}
        benefitItems={null} media={null} items={null} />,
    );
    const skeletonGrid = screen.getByTestId('packages-skeleton').querySelector('.pb-package-grid');
    expect(skeletonGrid).not.toBeNull();
    expect(skeletonGrid!.closest('.pb-wrap')).not.toBeNull();
    unmount();

    render(
      <PackageList intro={null} introSub={null} benefitHeading={null} benefitSub={null}
        benefitItems={null} media={null} items={[]} />,
    );
    const emptyBlock = screen.getByTestId('packages-empty').querySelector('.pb-packages-empty-block');
    expect(emptyBlock).not.toBeNull();
    expect(emptyBlock!.closest('.pb-wrap')).not.toBeNull();
  });
});