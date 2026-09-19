import { default as React } from 'react';
import { DiscountStep, MediaSlots, PackageItem } from '../lib/types';
export interface PackageListProps {
    /** 섹션 도입 문구. copy 데이터에서 온다 — 하드코딩하지 않는다. */
    intro: string | null;
    /** 섹션 보조 문구(copy: package_intro_sub). null 이면 생략한다. */
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
/**
 * 패키지 그리드 — 3카드. is_featured 면 강조(다크) 카드.
 *
 * 원문 `#package` 는 패키지 카드 위에 스테이지(.package-stage)를 두고 그 안에
 * 도입 카피를 얹는다(body.html 171–180). 그 스테이지가 모듈 슬롯 `package_stage` 의
 * 자리다 — 슬롯 URL 이 있으면 이미지, 없으면 중립 CSS 폴백(원문 Unsplash 제거, 스펙 §8).
 * 카드 아래에는 동시작업 혜택 박스(benefit-box)를 둔다(body.html 229–243).
 *
 * 문구는 전부 props 로 받는다(COPY POLICY — 하드코딩 금지).
 * 원문의 eyebrow(`Pinkbro F&B Package`/`Multi-Service Benefit`)와 카드 라벨
 * (`A Package` 등)은 copy 도메인에 키가 없어 렌더하지 않는다 — 리포트의 COPY REQUIRED 참조.
 */
export declare function PackageList({ intro, introSub, benefitHeading, benefitSub, benefitItems, items, media, }: PackageListProps): React.ReactElement;
export default PackageList;
