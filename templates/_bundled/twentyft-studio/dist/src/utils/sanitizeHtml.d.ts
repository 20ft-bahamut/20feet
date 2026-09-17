/**
 * 관리자가 작성한 게시판 본문을 화면에 넣기 전에 정리한다.
 *
 * 본문은 G7 게시판 에디터가 만든 HTML이라 그대로 넣으면 위험하다.
 * 허용한 태그와 속성만 남기고, 나머지는 텍스트로 되돌린다.
 *
 * - script / style / iframe / object / embed / form / input 등은 통째로 제거
 * - on* 이벤트 속성 제거
 * - javascript:, data: 같은 안전하지 않은 URL 제거
 *
 * 브라우저 DOM이 없는 환경(테스트 등)에서는 태그를 모두 벗겨 텍스트만 남긴다.
 */
export declare function sanitizeHtml(html: string): string;
export default sanitizeHtml;
