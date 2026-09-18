import React, { forwardRef } from 'react';

export interface PProps extends React.HTMLAttributes<HTMLParagraphElement> {}

/**
 * 기본 p(문단) 컴포넌트
 */
export const P = forwardRef<HTMLParagraphElement, PProps>(({
  children,
  className = '',
  ...props
}, ref) => {
  return (
    <p
      ref={ref}
      className={className}
      {...props}
    >
      {children}
    </p>
  );
});

P.displayName = 'P';
