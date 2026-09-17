export interface PageMetaInput {
    title: string;
    description: string;
    /**
     * 대표 주소. 같은 내용이 두 주소로 열리는 경우(이전 주소 등) 대표 주소를 지정한다.
     * 지정하지 않으면 현재 경로를 쓴다.
     */
    canonicalPath?: string;
}
/**
 * 문서 제목·설명·canonical 을 현재 페이지에 맞춘다.
 *
 * G7 코어 엔진은 이 셋을 클라이언트에서 갱신하지 않는다. 그래서 라우트를 이동해도
 * 탭 제목이 블레이드 기본값으로 남고, 이전 주소 화면에는 canonical 이 없다.
 * 코어를 고치지 않고 페이지 컴포넌트에서 적용한다.
 *
 * 중복 생성 방지: 이미 있는 태그를 찾아 갱신하고, 없을 때만 만든다.
 * canonical 은 항상 현재 origin 을 기준으로 만들어 개발/운영 주소가 섞이지 않게 한다.
 */
export declare function usePageMeta({ title, description, canonicalPath }: PageMetaInput): void;
export default usePageMeta;
