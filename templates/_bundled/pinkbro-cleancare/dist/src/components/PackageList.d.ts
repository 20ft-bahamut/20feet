import { default as React } from 'react';
import { DiscountStep, MediaSlots, PackageItem } from '../lib/types';
export interface PackageListProps {
    /** 섹션 도입 문구(copy: package_intro — 원문 .package-copy 안의 h2). null 이면 생략한다. */
    intro: string | null;
    /** 섹션 보조 문구(copy: package_intro_sub — 원문 .sub). null 이면 생략한다. */
    introSub: string | null;
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
export declare function PackageList({ intro, introSub, benefitHeading, benefitSub, benefitItems, items, media, }: PackageListProps): React.ReactElement;
export default PackageList;
