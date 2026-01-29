import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: ReactNode;
}

const variantStyles = {
  primary: 'bg-white text-slate-950 hover:bg-blue-600 hover:text-white shadow-xl',
  secondary: 'bg-slate-900 text-slate-200 hover:bg-slate-800 border border-slate-800',
  ghost: 'bg-transparent border border-slate-700 text-slate-200 hover:bg-slate-900'
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
      className={`inline-flex items-center justify-center rounded-2xl transition-colors duration-base focus-visible:outline-none focus-visible:ring focus-visible:ring-blue-500/40 font-semibold ${
        variantStyles[variant]
      } ${sizeStyles[size]} ${disabled || isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
      {...props}
    >
      {isLoading ? 'Cargando…' : children}
    </button>
  );
}
