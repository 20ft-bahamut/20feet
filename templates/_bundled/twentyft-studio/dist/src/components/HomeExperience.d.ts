import { default as React } from 'react';
import { PortfolioItem, EditorAttrs } from '../types/template';
export interface HomeExperienceProps {
    /** 담당자가 실제로 맡은 프로젝트. 소개 문장의 근거로 연결한다. */
    cases?: PortfolioItem[] | null;
    className?: string;
    editorAttrs?: EditorAttrs;
}
/**
 * 담당자 경험.
 *
 * 추상적인 역량 카드를 나열하지 않는다. 확인된 경력 사실만 짧게 쓰고,
 * 그 근거로 실제 사례와 소개 페이지를 연결한다.
 * 팀 규모·작업 건수·만족도는 확인되지 않았으므로 넣지 않는다.
 */
export declare function HomeExperience({ cases, className, editorAttrs }: HomeExperienceProps): React.ReactElement;
export default HomeExperience;
