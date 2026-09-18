import React, { forwardRef } from 'react';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

/**
 * 기본 label 컴포넌트
 */
export const Label = forwardRef<HTMLLabelElement, LabelProps>(({
  children,
  className = '',
  ...props
}, ref) => {
  return (
    <label
      ref={ref}
      className={className}
      {...props}
    >
      {children}
    </label>
  );
});

Label.displayName = 'Label';
