import { default as React } from 'react';
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
}
/**
 * 기본 textarea 컴포넌트
 *
 * 초기값은 React 관례대로 `defaultValue` 로 전달한다 (children 도 값으로 쓰인다).
 */
export declare const Textarea: React.ForwardRefExoticComponent<TextareaProps & React.RefAttributes<HTMLTextAreaElement>>;
