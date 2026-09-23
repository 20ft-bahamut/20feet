import { default as React } from 'react';
import { CaseItem, MediaSlots } from '../lib/types';
export interface CaseGalleryProps {
    /** 섹션 소개 문구 — copy 도메인에서 온다. null 이면 렌더하지 않는다. */
    intro: string | null;
    /** 섹션 보조 문구(copy: projects_sub). null 이면 렌더하지 않는다. 헤더 오른쪽 하단에 정렬된다. */
    sub: string | null;
    /** 하단 주의 문구 — null 이면 렌더하지 않는다. */
    note: string | null;
    /** 사례 목록. null = 로딩 중(스켈레톤), [] = 빈 상태. */
    items: CaseItem[] | null;
    /**
     * 미디어 슬롯 키 → 슬롯. null = 아직 로딩 중.
     * `case_1`…`case_4` 가 카드 순서대로의 커버 슬롯이다.
     */
    media: MediaSlots | null;
    /**
     * 섹션 눈금(원문 `Recent Projects`, 371행 / copy: projects_eyebrow).
     * 값을 받으면 렌더하고, 없으면 헤더는 소개 문구만 렌더한다.
     */
    eyebrow?: string | null;
    /**
     * 카드 킥커(원문 `PINKBRO PROJECT`, 379·383·387·391행 / copy: projects_card_kicker).
     * 값을 받으면 카드마다 렌더하고, 없으면 생략한다.
     */
    cardKicker?: string | null;
    /**
     * 카드 링크 문구(원문 `작업사례 자세히 보기`, 379행 / copy: projects_link_label).
     * 값을 받으면 `blog_url` 여부와 무관하게 렌더한다 — 원문도 링크가 비어 있어도
     * `.project-link` 라벨을 항상 보여준다 (body.html 379행 / styles.css 276행).
     */
    linkLabel?: string | null;
}
export declare function CaseGallery({ intro, sub, note, items, media, eyebrow, cardKicker, linkLabel, }: CaseGalleryProps): React.ReactElement;
export default CaseGallery;
