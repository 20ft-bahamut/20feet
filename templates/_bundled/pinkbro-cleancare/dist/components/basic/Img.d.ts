import { default as React } from 'react';
export interface ImgProps extends React.ImgHTMLAttributes<HTMLImageElement> {
}
/**
 * 기본 img 컴포넌트 (void 요소 — children 을 받지 않는다)
 */
export declare const Img: React.ForwardRefExoticComponent<ImgProps & React.RefAttributes<HTMLImageElement>>;
