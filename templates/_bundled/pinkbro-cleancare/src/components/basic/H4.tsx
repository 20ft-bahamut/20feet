import React, { forwardRef } from 'react';

export interface H4Props extends React.HTMLAttributes<HTMLHeadingElement> {}

/**
 * 기본 h4 제목 컴포넌트
 */
export const H4 = forwardRef<HTMLHeadingElement, H4Props>(({
  children,
  className = '',
  ...props
}, ref) => {
  return (
    <h4
      ref={ref}
      className={className}
      {...props}
    >
      {children}
    </h4>
  );
});

H4.displayName = 'H4';
