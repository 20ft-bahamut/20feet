import { default as React } from 'react';
export interface ZoomableImageProps {
    src: string;
    /** 이미지 설명. 확대 화면에서도 같은 설명을 쓴다. */
    alt: string;
    /** 목록·상세에서 보이는 크기. 확대 화면은 이 값을 쓰지 않는다. */
    style?: React.CSSProperties;
    /** 확대 화면에서 쓸 원본 주소. 없으면 src 를 그대로 쓴다. */
    fullSrc?: string;
    /** 확대 화면 설명 문구. 기본은 alt */
    caption?: string;
    loading?: 'lazy' | 'eager';
    testId?: string;
}
/**
 * 눌러서 크게 보는 이미지.
 *
 * 사례 화면은 업무 UI 가 작게 들어가 있어 상세에서도 읽기 어렵다. 이미지 자체를
 * 키우는 대신, 누르면 원본 크기로 여는 경로를 둔다.
 *
 * 구조를 세 층으로 나눈 데는 이유가 있다.
 *   ① 배경(overlay)  — 화면 고정. 스크롤하지 않는다.
 *   ② 이미지 영역     — 여기만 스크롤한다. 안쪽 래퍼가 `margin: auto` 로 정렬한다.
 *   ③ 조작 줄         — ② 바깥에 둔다. 이미지를 옆으로 밀어도 닫기 버튼이 화면에 남는다.
 *
 * `justify-content: center` 로 가운데 정렬하면 이미지가 영역보다 클 때 시작점이
 * 음수로 밀려 왼쪽·위쪽 일부에 스크롤로도 닿을 수 없다. `margin: auto` 는
 * 들어맞을 때는 가운데로 보내고, 넘칠 때는 시작점을 남겨 둔다.
 *
 * 닫는 방법: 닫기 버튼 / Esc / 바깥 누르기. 열면 초점이 닫기 버튼으로 가고
 * Tab·Shift+Tab 은 확대창 안에서만 돈다. 닫으면 원래 누른 자리로 돌아온다.
 */
export declare function ZoomableImage({ src, alt, style, fullSrc, caption, loading, testId, }: ZoomableImageProps): React.ReactElement;
export default ZoomableImage;
