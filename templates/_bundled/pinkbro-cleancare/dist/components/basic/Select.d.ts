import { default as React } from 'react';
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
}
/**
 * 기본 select 컴포넌트 — option 은 children 으로 받는다
 */
export declare const Select: React.ForwardRefExoticComponent<SelectProps & React.RefAttributes<HTMLSelectElement>>;
