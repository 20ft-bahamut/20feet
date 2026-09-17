import { default as React } from 'react';
import { EditorAttrs } from '../types/template';
export interface HomeHeroProps {
    className?: string;
    editorAttrs?: EditorAttrs;
}
/**
 * 첫 화면.
 *
 * 제목·설명·행동만 남긴다. 강조 라벨(eyebrow)은 제목과 같은 말을 반복하므로 두지 않는다.
 * 실제 작업 화면은 바로 다음 섹션에서 크게 보여준다 — 같은 이미지를 두 번 쓰지 않는다.
 *
 * 데스크톱은 문장 의미 단위로 줄을 나누고, 좁은 화면에서는 강제 줄바꿈을 끄고
 * 자연스럽게 접히게 한다(`.hero-line-break`).
 * <br> 뒤의 {' '} 는 줄바꿈을 껐을 때 앞 문장과 붙어 버리는 것을 막는다.
 */
export declare function HomeHero({ className, editorAttrs }: HomeHeroProps): React.ReactElement;
export default HomeHero;
