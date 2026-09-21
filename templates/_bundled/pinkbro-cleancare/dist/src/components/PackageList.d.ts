import { default as React } from 'react';
import { DiscountStep, MediaSlots, PackageItem } from '../lib/types';
export interface PackageListProps {
    /** 스테이지 눈금(copy: package_stage_eyebrow, 원문 175행). null 이면 생략한다. */
    stageEyebrow?: string | null;
    /** 섹션 도입 문구(copy: package_intro — 원문 .package-copy 안의 h2). null 이면 생략한다. */
    intro: string | null;
    /** 섹션 보조 문구(copy: package_intro_sub — 원문 .sub). null 이면 생략한다. */
    introSub: string | null;
    /**
     * 카드 라벨(copy: package_a_label / package_b_label / package_c_label, 원문 .pkg-label).
     * 원문 카드 순서(A·B·C)와 모듈 `sort`(1·2·3)가 같으므로 카드 index 로 대응한다.
     * null 이면 그 카드의 라벨만 생략한다.
     */
    labelA?: string | null;
    labelB?: string | null;
    labelC?: string | null;
    /**
     * 카드 가격 아래 원문 노트(copy: package_a_note / package_a_note_sub …).
     * 원문 .pkg-note 는 `기본가 합계 …<br>… 동시작업 … 적용` 한 줄이라
     * 두 값을 사이에 <br> 을 두고 렌더한다. null 이면 그 카드의 노트만 생략한다.
     */
    noteA?: string | null;
    noteASub?: string | null;
    noteB?: string | null;
    noteBSub?: string | null;
    noteC?: string | null;
    noteCSub?: string | null;
    /** 동시작업 혜택 박스 눈금(copy: benefit_eyebrow, 원문 232행). null 이면 생략한다. */
    benefitEyebrow?: string | null;
    /** 동시작업 혜택 박스 제목(copy: benefit_heading). null 이면 제목을 생략한다. */
    benefitHeading: string | null;
    /** 동시작업 혜택 박스 안내 문구(copy: benefit_sub). */
    benefitSub: string | null;
    /** 동시작업 할인 표(copy: benefit_items — 원문 benefit-grid 4행). null = 로딩 중, [] = 행 없음. */
    benefitItems: DiscountStep[] | null;
    /** 패키지 목록. null = 로딩 중, [] = 데이터 없음. */
    items: PackageItem[] | null;
    /** 미디어 슬롯 키 → 슬롯. null = 아직 로딩 중. `package_stage` 가 이 섹션의 스테이지 이미지다. */
    media: MediaSlots | null;
}
export declare function PackageList({ stageEyebrow, intro, introSub, labelA, labelB, labelC, noteA, noteASub, noteB, noteBSub, noteC, noteCSub, benefitEyebrow, benefitHeading, benefitSub, benefitItems, items, media, }: PackageListProps): React.ReactElement;
export default PackageList;
