/**
 * 페이지별 문서 제목·설명.
 *
 * 배경: G7 코어 엔진은 클라이언트에서 document.title / meta description 을 갱신하지 않는다
 * (코어 번들에 해당 처리가 없다 — 확인 완료). 그래서 서버가 SEO 봇에게 주는 head 는
 * 페이지별로 맞지만, 일반 방문자의 탭 제목은 블레이드 기본값 하나로 고정된다.
 * 코어를 고치지 않고 템플릿에서 `usePageMeta` 로 같은 값을 적용한다.
 *
 * 서버(SeoMiddleware)가 쓰는 값과 어긋나지 않도록 lang/*.json 의 routes.*.title 과
 * 같은 문구를 쓴다. 한쪽만 바꾸면 봇과 방문자가 다른 제목을 보게 된다.
 */
export interface PageMeta {
    title: string;
    description: string;
}
/** 고정 경로의 문서 정보. */
export declare const PAGE_META: Record<string, PageMeta>;
/** 상세 페이지의 제목·설명을 만든다. 이름이 없으면 목록 제목으로 되돌린다. */
export declare function detailMeta(name: string | undefined, fallbackPath: string, description?: string): PageMeta;
