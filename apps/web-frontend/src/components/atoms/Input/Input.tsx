import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className = '', ...props }: InputProps) {
  return (
    <label className="space-y-1 text-sm block font-medium text-neutral-900">
      {label && <span>{label}</span>}
      <input
        className={`w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-base focus:border-primary-500 focus:ring-2 focus:ring-primary-200 ${className}`}
        {...props}
      />
    </label>
  );
}
