import { default as React } from 'react';
import { MediaSlots, ServiceItem } from '../lib/types';
export interface ServiceGridProps {
    /** 섹션 제목(copy: service_intro). 원문 .section-head .copy > .h2. \n 은 줄바꿈으로 렌더한다. */
    intro: string | null;
    /** 섹션 보조 문구(copy: service_intro_sub). 원문 .section-head > .sub — 제목과 아래정렬 오른쪽 열. */
    introSub: string | null;
    /** 섹션 eyebrow(copy: service_eyebrow — 모듈 copy 도메인에 키가 없다. COPY REQUIRED). null 이면 생략한다. */
    eyebrow?: string | null;
    /** 서비스 카드의 상세 펼침 라벨(copy: service_detail_label). null 이면 ＋ 마커만 남는다. */
    detailLabel: string | null;
    /** 목록에 없는 서비스 안내 박스 제목(copy: extra_box_heading). null 이면 박스를 숨긴다. */
    extraHeading: string | null;
    /** 목록에 없는 서비스 안내 박스 본문(copy: extra_box_body). */
    extraBody: string | null;
    /** extra-box CTA 라벨(copy: extra_box_cta — 모듈 copy 도메인에 키가 없다. COPY REQUIRED). */
    extraCtaLabel?: string | null;
    /** extra-box CTA 링크 대상. 원문 앵커는 #estimate 이다. */
    extraCtaHref?: string | null;
    /** 서비스 목록. null = 로딩 중, [] = 데이터 없음. */
    items: ServiceItem[] | null;
    /** 모듈 이미지 슬롯. */
    media: MediaSlots | null;
}
/**
 * 서비스 그리드 — 사진 우선순위: 슬롯 URL → 번들 템플릿 자산 → 중립 CSS 블록.
 * (D7 + D9 결합: 서비스 6종은 기본 탑재 사진이 있으므로 폴백이 중립 블록이 아니다)
 *
 * 문구는 전부 props 로 받는다(COPY POLICY — 하드코딩 금지).
 * 원문 extra-box 의 CTA(`기타 서비스 문의하기`)와 섹션 eyebrow(`Core Service`)는
 * copy 도메인에 키가 없어 props 가 주어지지 않으면 렌더하지 않는다 — COPY REQUIRED 참조.
 */
export declare function ServiceGrid({ intro, introSub, eyebrow, detailLabel, extraHeading, extraBody, extraCtaLabel, extraCtaHref, items, media, }: ServiceGridProps): React.ReactElement;
export default ServiceGrid;
