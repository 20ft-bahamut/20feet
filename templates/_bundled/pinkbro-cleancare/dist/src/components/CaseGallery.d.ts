import { default as React } from 'react';
import { CaseItem } from '../lib/types';
export interface CaseGalleryProps {
    /** 섹션 소개 문구 — copy 도메인에서 온다. null 이면 렌더하지 않는다. */
    intro: string | null;
    /** 하단 주의 문구 — null 이면 렌더하지 않는다. */
    note: string | null;
    /** 사례 목록. null = 로딩 중(스켈레톤), [] = 빈 상태. */
    items: CaseItem[] | null;
}
/**
 * 작업사례 갤러리 (소스 `#projects` / `.project-*` 이식).
 *
 * 3단계 폴백: items null → 스켈레톤, [] → 빈 상태, 배열 → 카드 렌더.
 * 커버 슬롯이 비면 소스 `.project-thumb` 의 CSS 그라디언트 폴백을 렌더한다.
 * `blog_url` 이 비면 `<a>` 대신 `<div aria-disabled="true">` 로 렌더한다 —
 * 소스가 `href="#"` 플레이스홀더로 두었던 문제를 없앤다 (SPEC §12 사용자 대기 항목).
 */
export declare function CaseGallery({ intro, note, items }: CaseGalleryProps): React.ReactElement;
export default CaseGallery;
