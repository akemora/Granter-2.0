import { LabelHTMLAttributes } from 'react';

export function Label({ className = '', children, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={`text-sm font-semibold uppercase tracking-[0.2em] text-neutral-600 ${className}`} {...props}>
      {children}
    </label>
  );
}
