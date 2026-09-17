/**
 * 자체 제작 데모의 고객용 표시 문구.
 *
 * 일반 고객이 보는 화면(홈·서비스 상세·제작 사례)에서는 제품 이름과 버전 정보를
 * 앞세우지 않는다. 대신 '무엇을 만든 화면인지'를 제목으로 쓰고,
 * 실제 제품명은 보조 정보로만 둔다. 제품 호환성·라이선스는 SuperBify 제품 상세에 그대로 남는다.
 *
 * DB의 제품 이름·slug·식별자는 바꾸지 않는다. 표시 문구만 여기서 정한다.
 */
export interface DemoDisplay {
    /** 고객용 대표 제목 */
    title: string;
    /** 확인된 화면과 기능 중심의 설명 */
    summary: string;
}
export declare const DEMO_DISPLAY: Record<string, DemoDisplay>;
/**
 * 데모의 고객용 표시를 돌려준다.
 * 표시 문구가 없는 제품은 게시판에 적힌 이름과 요약을 그대로 쓴다.
 */
export declare function getDemoDisplay(slug: string, fallbackTitle: string, fallbackSummary?: string): DemoDisplay;
/** 첨부 URL 에서 첨부 id 를 뽑는다. 형식이 다르면 빈 문자열. */
export declare function attachmentId(url: string): string;
export declare function screenshotKind(url: string): 'ui' | 'brand';
