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
     * 값을 받고 `blog_url` 이 있을 때만 렌더한다.
     */
    linkLabel?: string | null;
}
/**
 * 작업사례 갤러리 (소스 `#projects` / `.project-*` 이식).
 *
 * 구조는 원문 그대로다: `.section-head`(왼쪽 눈금+소개 / 오른쪽 보조 문구,
 * 하단 정렬 2단) → `.project-grid`(4열 카드) → `.project-note`.
 *
 * 3단계 폴백: items null → 스켈레톤, [] → 빈 상태, 배열 → 카드 렌더.
 *
 * 카드 커버는 3단 폴백이다:
 *   1. 항목이 이미 해석해 온 슬롯 결과(`item.cover.url`) — 있으면 그 URL 이 이긴다
 *   2. 카드 순번의 슬롯(`case_1`…`case_4`)에 관리자가 올린 URL
 *   3. 번들 자리표시자 사진(SLOT_PHOTO) — 슬롯이 비어 있을 때 그 자리를 채운다
 *   4. 셋 다 없으면 `.pb-project-thumb` 의 CSS 그라디언트 폴백
 *
 * 슬롯 키는 항목이 `cover_slot` 을 들고 오면 그 키를, 아니면 카드 순번을 쓴다.
 * 공개 API(CaseResource)는 아직 `cover_slot` 을 내려주지 않으므로 현재는 순번으로
 * 해석된다 — 관리자가 순서를 바꾸면 그 순번의 슬롯 사진이 그 자리에 온다.
 *
 * `blog_url` 이 비면 `<a>` 대신 `<div aria-disabled="true">` 로 렌더한다 —
 * 소스가 `href="#"` 플레이스홀더로 두었던 문제를 없앤다 (SPEC §12 사용자 대기 항목).
 *
 * 눈금(`Recent Projects`)·카드 킥커(`PINKBRO PROJECT`)·링크 문구
 * (`작업사례 자세히 보기`)는 원문에 있는 문구이며 copy 도메인 키
 * (projects_eyebrow / projects_card_kicker / projects_link_label)로 배선됐다.
 * 값이 없으면 리터럴로 대체하지 않고 조용히 생략한다 (COPY POLICY).
 */
export declare function CaseGallery({ intro, sub, note, items, media, eyebrow, cardKicker, linkLabel, }: CaseGalleryProps): React.ReactElement;
export default CaseGallery;
