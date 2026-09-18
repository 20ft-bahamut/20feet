import React, { forwardRef } from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

/**
 * 기본 button 컴포넌트
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  className = '',
  ...props
}, ref) => {
  return (
    <button
      ref={ref}
      className={className}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';
