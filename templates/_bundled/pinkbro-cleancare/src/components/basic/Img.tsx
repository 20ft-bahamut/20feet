import React, { forwardRef } from 'react';

export interface ImgProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

/**
 * 기본 img 컴포넌트 (void 요소 — children 을 받지 않는다)
 */
export const Img = forwardRef<HTMLImageElement, ImgProps>(({
  className = '',
  alt = '',
  ...props
}, ref) => {
  return (
    <img
      ref={ref}
      className={className}
      alt={alt}
      {...props}
    />
  );
});

Img.displayName = 'Img';
