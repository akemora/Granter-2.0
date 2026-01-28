import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: ReactNode;
}

const variantStyles = {
  primary: 'bg-primary-500 text-white shadow-md hover:bg-primary-600',
  secondary: 'bg-neutral-900 text-white hover:bg-neutral-800',
  ghost: 'bg-transparent border border-neutral-300 text-neutral-900'
};

const sizeStyles = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-5 py-3 text-lg'
};

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center rounded-md transition-colors duration-base focus-visible:outline-none focus-visible:ring focus-visible:ring-primary-300 ${
        variantStyles[variant]
      } ${sizeStyles[size]} ${disabled || isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
      {...props}
    >
      {isLoading ? 'Loading…' : children}
    </button>
  );
}
