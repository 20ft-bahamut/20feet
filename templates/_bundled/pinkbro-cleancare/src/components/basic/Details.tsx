import React, { forwardRef } from 'react';

export interface DetailsProps extends React.HTMLAttributes<HTMLDetailsElement> {}

/**
 * 기본 details(접기/펼치기) 컴포넌트
 */
export const Details = forwardRef<HTMLDetailsElement, DetailsProps>(({
  children,
  className = '',
  ...props
}, ref) => {
  return (
    <details
      ref={ref}
      className={className}
      {...props}
    >
      {children}
    </details>
  );
});

Details.displayName = 'Details';
