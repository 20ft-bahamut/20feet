import { default as React } from 'react';
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
}
/**
 * 기본 input 컴포넌트 (void 요소 — children 을 받지 않는다)
 */
export declare const Input: React.ForwardRefExoticComponent<InputProps & React.RefAttributes<HTMLInputElement>>;
