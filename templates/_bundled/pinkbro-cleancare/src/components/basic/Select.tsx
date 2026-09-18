import React, { forwardRef } from 'react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

/**
 * 기본 select 컴포넌트 — option 은 children 으로 받는다
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  children,
  className = '',
  ...props
}, ref) => {
  return (
    <select
      ref={ref}
      className={className}
      {...props}
    >
      {children}
    </select>
  );
});

Select.displayName = 'Select';
