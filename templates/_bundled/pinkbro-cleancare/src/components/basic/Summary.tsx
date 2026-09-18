import React, { forwardRef } from 'react';

export interface SummaryProps extends React.HTMLAttributes<HTMLElement> {}

/**
 * 기본 summary(details 요약 줄) 컴포넌트
 */
export const Summary = forwardRef<HTMLElement, SummaryProps>(({
  children,
  className = '',
  ...props
}, ref) => {
  return (
    <summary
      ref={ref}
      className={className}
      {...props}
    >
      {children}
    </summary>
  );
});

Summary.displayName = 'Summary';
