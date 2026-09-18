import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

/**
 * 기본 input 컴포넌트 (void 요소 — children 을 받지 않는다)
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(({
  className = '',
  ...props
}, ref) => {
  return (
    <input
      ref={ref}
      className={className}
      {...props}
    />
  );
});

Input.displayName = 'Input';
