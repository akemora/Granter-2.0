# 🎨 PROPUESTA FRONTEND DESDE 0 - GRANTER V2

**Frontend Architecture with Tailwind CSS, Design Tokens & Accessibility** | v1.0 | 2026-01-27

> **Objetivo:** Construir UI moderna, accesible (WCAG 2.1 AA), y escalable que evita los errores de GRANTER v1 (<5% test coverage, no design tokens, UI hardcoded).
>
> **Stack:** Next.js 16 + React 19 + TypeScript + Tailwind CSS + React Testing Library

---

## 📋 Índice

- [1. Arquitectura General](#1-arquitectura-general)
- [2. Design Tokens Centralizados](#2-design-tokens-centralizados)
- [3. Estructura de Componentes](#3-estructura-de-componentes)
- [4. Atomic Design](#4-atomic-design)
- [5. Convenciones CSS (Tailwind)](#5-convenciones-css-tailwind)
- [6. Accesibilidad (a11y)](#6-accesibilidad-a11y)
- [7. Responsive Design (Mobile-First)](#7-responsive-design-mobile-first)
- [8. Performance Optimization](#8-performance-optimization)
- [9. Testing Frontend](#9-testing-frontend)
- [10. Ejemplos Completos](#10-ejemplos-completos)

---

## 1. Arquitectura General

### 1.1 Stack y Justificación

```
Next.js 16 (App Router)
├─ Framework full-stack moderno
├─ Server Components para performance
├─ Built-in API routes (si necesario)
└─ Automatic code splitting

React 19
├─ Componentes funcionales + hooks
├─ Concurrent features
└─ Improved hydration

TypeScript
├─ Type safety (previene errores)
├─ Better IDE support
└─ Compilador strict

Tailwind CSS
├─ Utility-first (rápido de desarrollar)
├─ Design tokens centralizados
├─ PurgeCSS (size: ~10KB minified)
└─ Dark mode support

React Testing Library
├─ Component unit tests
├─ Integration tests
└─ a11y assertions

Playwright
├─ E2E tests
├─ Cross-browser
└─ Visual regression (optional)
```

### 1.2 Principios Arquitectónicos

```
✅ OBLIGATORIO:

1. Design Tokens First
   - NUNCA CSS inline duplicado
   - NUNCA magic numbers
   - Todos los valores en tailwind.config.js

2. Component-Based
   - Atomic Design (Atoms → Molecules → Organisms)
   - Props-driven
   - Single Responsibility

3. Accessibility First
   - WCAG 2.1 AA compliance
   - Semantic HTML
   - ARIA attributes where needed
   - Keyboard navigation

4. Mobile-First Responsive
   - Base styles for mobile
   - Tailwind breakpoints: sm, md, lg, xl, 2xl
   - Touch-friendly targets (48px minimum)

5. Performance
   - Code splitting (dynamic imports)
   - Image optimization (next/image)
   - CSS-in-JS: 0 (usar Tailwind)
   - Bundle size < 300KB gzipped
```

---

## 2. Design Tokens Centralizados

### 2.1 tailwind.config.js - La Fuente de la Verdad

```javascript
// tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class', // Enable dark mode
  theme: {
    extend: {
      // ========== COLORS ==========
      colors: {
        // Primary (grants, actions)
        primary: {
          50: '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8',
          500: '#0EA5E9', // Main brand color
          600: '#0284C7',
          700: '#0369A1',
          800: '#075985',
          900: '#0C3B66',
        },
        // Secondary (search, filters)
        secondary: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#22C55E', // Secondary brand
          600: '#16A34A',
          700: '#15803D',
          800: '#166534',
          900: '#145231',
        },
        // Neutral (text, backgrounds)
        neutral: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373', // Text muted
          600: '#525252',
          700: '#404040', // Text normal
          800: '#262626',
          900: '#171717',
          950: '#0A0A0A',
        },
        // Status colors
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        info: '#3B82F6',
      },

      // ========== SPACING ==========
      spacing: {
        xs: '4px',   // 0.25rem
        sm: '8px',   // 0.5rem
        md: '16px',  // 1rem
        lg: '24px',  // 1.5rem
        xl: '32px',  // 2rem
        '2xl': '48px', // 3rem
      },

      // ========== TYPOGRAPHY ==========
      fontFamily: {
        base: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
        mono: [
          '"Fira Code"',
          '"Courier New"',
          'monospace',
        ],
      },
      fontSize: {
        // Mobile first, then override with md: breakpoint
        xs: ['12px', { lineHeight: '16px', letterSpacing: '0px' }],
        sm: ['14px', { lineHeight: '20px', letterSpacing: '0px' }],
        base: ['16px', { lineHeight: '24px', letterSpacing: '0px' }],
        lg: ['18px', { lineHeight: '28px', letterSpacing: '0px' }],
        xl: ['20px', { lineHeight: '28px', letterSpacing: '0px' }],
        '2xl': ['24px', { lineHeight: '32px', letterSpacing: '0px' }],
        '3xl': ['30px', { lineHeight: '36px', letterSpacing: '-0.01em' }],
        '4xl': ['36px', { lineHeight: '40px', letterSpacing: '-0.02em' }],
      },
      fontWeight: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },
      lineHeight: {
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.75,
      },

      // ========== BORDER RADIUS ==========
      borderRadius: {
        none: '0px',
        sm: '2px',
        md: '4px',
        lg: '8px',
        xl: '12px',
        full: '9999px',
      },

      // ========== SHADOWS ==========
      boxShadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'focus': '0 0 0 3px rgba(14, 165, 233, 0.1), 0 0 0 6px rgba(14, 165, 233, 0.5)',
      },

      // ========== TRANSITIONS ==========
      transitionDuration: {
        fast: '150ms',
        base: '200ms',
        slow: '300ms',
      },
      transitionTimingFunction: {
        DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
        'ease-in': 'cubic-bezier(0.4, 0, 1, 1)',
        'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
      },

      // ========== Z-INDEX ==========
      zIndex: {
        dropdown: 1000,
        modal: 1050,
        tooltip: 1100,
        toast: 1150,
      },

      // ========== BREAKPOINTS ==========
      // Mobile-first: xs (0), sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px)
    },
  },
  plugins: [
    require('@tailwindcss/forms'),      // Better form styling
    require('@tailwindcss/typography'), // Prose for rich text
    require('@tailwindcss/aspect-ratio'),
  ],
};
```

### 2.2 CSS Global Styles

```css
/* src/styles/globals.css */

@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

/* ========== RESET DEFAULTS ========== */
html {
  scroll-behavior: smooth;
}

body {
  @apply bg-neutral-50 text-neutral-900 font-base;
  /* Prevent iOS zoom on input focus */
  font-size: 16px;
}

/* ========== FOCUS VISIBLE (ACCESSIBILITY) ========== */
:focus-visible {
  @apply outline-2 outline-offset-2 outline-primary-500;
}

/* ========== DARK MODE ========== */
[data-theme='dark'] {
  @apply bg-neutral-950 text-neutral-50;
}

[data-theme='dark'] a {
  @apply text-primary-400;
}

/* ========== UTILITY CLASSES ========== */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.truncate-line-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.truncate-line-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ========== SCROLLBAR STYLING (OPTIONAL) ========== */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  @apply bg-neutral-100;
}

::-webkit-scrollbar-thumb {
  @apply bg-neutral-400 rounded-lg;
}

::-webkit-scrollbar-thumb:hover {
  @apply bg-neutral-500;
}
```

---

## 3. Estructura de Componentes

### 3.1 Directorio Structure (Atomic Design)

```
src/components/
├── atoms/                    # Smallest UI blocks
│   ├── Button/
│   │   ├── Button.tsx       # Component
│   │   ├── Button.test.tsx  # Unit test
│   │   └── index.ts         # Export
│   ├── Input/
│   ├── Label/
│   ├── Badge/
│   └── Icon/
│
├── molecules/               # Combination of atoms
│   ├── FormField/          # Label + Input + Error
│   ├── Card/
│   ├── Modal/
│   ├── Breadcrumbs/
│   └── SearchBox/          # Input + Icon + Button
│
├── organisms/              # Complex components
│   ├── Header/
│   ├── Navigation/
│   ├── LoginForm/          # Multiple FormField molecules
│   ├── SearchPage/         # Complex page component
│   ├── GrantDetail/
│   └── Footer/
│
└── layouts/               # Page layouts
    ├── AuthLayout/        # For login/register
    ├── AppLayout/         # For authenticated pages
    └── 404Layout/
```

### 3.2 Componente Genérico (Ejemplo: Button)

```typescript
// src/components/atoms/Button/Button.tsx

import { ButtonHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual variant */
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Is loading state */
  isLoading?: boolean;
  /** Children content */
  children: ReactNode;
  /** Full width button */
  fullWidth?: boolean;
  /** Icon before text (optional) */
  icon?: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  fullWidth = false,
  icon,
  disabled,
  className,
  ...props
}: ButtonProps) {
  const baseStyles = 'font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2';

  const variantStyles: Record<string, string> = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 focus-visible:ring-primary-500',
    secondary: 'bg-neutral-200 text-neutral-900 hover:bg-neutral-300 active:bg-neutral-400 focus-visible:ring-neutral-500',
    danger: 'bg-danger text-white hover:bg-red-600 active:bg-red-700 focus-visible:ring-danger',
    ghost: 'bg-transparent text-primary-500 hover:bg-primary-50 active:bg-primary-100 focus-visible:ring-primary-500',
  };

  const sizeStyles: Record<string, string> = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : '';
  const widthStyles = fullWidth ? 'w-full' : '';

  return (
    <button
      disabled={disabled || isLoading}
      className={clsx(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        disabledStyles,
        widthStyles,
        className
      )}
      {...props}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {isLoading ? '...' : children}
    </button>
  );
}
```

---

## 4. Atomic Design

### 4.1 Atoms (Primitivos)

```typescript
// Button, Input, Label, Badge, Icon, Text
// Reutilizables, no dependencies en otros componentes
```

### 4.2 Molecules (Combinations)

```typescript
// src/components/molecules/FormField/FormField.tsx

import { ReactNode } from 'react';
import { Input } from '@/components/atoms/Input';
import { Label } from '@/components/atoms/Label';

interface FormFieldProps {
  label: string;
  name: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}

export function FormField({
  label,
  name,
  error,
  required,
  children,
}: FormFieldProps) {
  return (
    <div className="mb-4">
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-danger ml-1">*</span>}
      </Label>
      {children}
      {error && (
        <span className="text-sm text-danger mt-1 block">{error}</span>
      )}
    </div>
  );
}
```

### 4.3 Organisms (Page-Level)

```typescript
// src/components/organisms/LoginForm/LoginForm.tsx

'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/atoms/Button';
import { FormField } from '@/components/molecules/FormField';
import { Input } from '@/components/atoms/Input';
import { useAuth } from '@/hooks/useAuth';

export function LoginForm() {
  const router = useRouter();
  const { login, isLoading, error } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await login(formData.email, formData.password);
      router.push('/dashboard');
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField label="Email" name="email" required>
        <Input
          id="email"
          type="email"
          name="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </FormField>

      <FormField label="Password" name="password" required error={error}>
        <Input
          id="password"
          type="password"
          name="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
        />
      </FormField>

      <Button
        type="submit"
        variant="primary"
        fullWidth
        isLoading={isLoading}
      >
        Login
      </Button>
    </form>
  );
}
```

---

## 5. Convenciones CSS (Tailwind)

### 5.1 Regla de Oro: NUNCA CSS Inline Repetido

```typescript
// ❌ INCORRECTO - CSS inline repetido
function GrantCard({ grant }: { grant: Grant }) {
  return (
    <div style={{ padding: '16px', backgroundColor: '#3B82F6', borderRadius: '8px' }}>
      <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>{grant.title}</h3>
    </div>
  );
}

function AnotherCard({ data }: { data: any }) {
  return (
    <div style={{ padding: '16px', backgroundColor: '#3B82F6', borderRadius: '8px' }}> {/* Duplicado! */}
      <p>{data.text}</p>
    </div>
  );
}

// ✅ CORRECTO - Design tokens en tailwind.config.js + clases Tailwind
function GrantCard({ grant }: { grant: Grant }) {
  return (
    <div className="p-md bg-primary-500 rounded-lg">
      <h3 className="text-lg font-bold">{grant.title}</h3>
    </div>
  );
}

function AnotherCard({ data }: { data: any }) {
  return (
    <div className="p-md bg-primary-500 rounded-lg">
      <p>{data.text}</p>
    </div>
  );
}
```

### 5.2 Utility Classes Pattern

```typescript
// src/styles/components.css (Optional for complex components)

@layer components {
  /* Card component */
  .card {
    @apply bg-white border border-neutral-200 rounded-lg shadow-base p-lg;
  }

  .card:hover {
    @apply shadow-md;
  }

  .card--compact {
    @apply p-md;
  }

  /* Button group */
  .button-group {
    @apply flex gap-md;
  }

  .button-group > * {
    @apply flex-1;
  }

  /* Form */
  .form-grid {
    @apply grid grid-cols-1 md:grid-cols-2 gap-md;
  }
}
```

### 5.3 Responsive Classes

```typescript
// Mobile-first approach
export function GrantsList({ grants }: { grants: Grant[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md">
      {grants.map((grant) => (
        <GrantCard key={grant.id} grant={grant} />
      ))}
    </div>
  );
}
```

---

## 6. Accesibilidad (a11y)

### 6.1 WCAG 2.1 AA Compliance

```
Requirement                          Implementation
──────────────────────────────────────────────────────────────
1.1.1 Non-text Content       → alt text on images
1.4.3 Contrast (Level AA)    → min 4.5:1 for text
2.1.1 Keyboard               → All interactive elements keyboard-accessible
2.1.2 No Keyboard Trap       → Escape key can exit components
2.4.1 Bypass Blocks          → Skip navigation link
2.4.2 Page Titled            → <title> and <h1>
2.4.3 Focus Order            → Logical tab order
2.4.7 Focus Visible          → Visible focus indicator
2.5.5 Target Size (WCAG 2.1) → Touch targets ≥ 44x44px
3.2.2 On Change              → No unexpected context switches
3.3.1 Error Identification   → Clear error messages
3.3.2 Labels or Instructions → <label> for form inputs
3.3.4 Error Prevention       → Undo/confirm for critical actions
4.1.2 Name Role Value        → ARIA attributes correct
4.1.3 Status Messages        → aria-live for dynamic updates
```

### 6.2 HTML Semántico

```typescript
// ✅ CORRECTO - HTML semántico
export function Page() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-primary-500 text-white py-lg px-md">
        <h1>Grants Portal</h1>
      </header>

      {/* Navigation */}
      <nav className="bg-neutral-100 px-md" aria-label="Main navigation">
        <ul className="flex gap-lg">
          <li><a href="/">Home</a></li>
          <li><a href="/search">Search</a></li>
          <li><a href="/about">About</a></li>
        </ul>
      </nav>

      {/* Main content */}
      <main className="flex-1 py-lg px-md">
        <article>
          <h2>Featured Grants</h2>
          <section>
            <h3>Technology Sector</h3>
            {/* Content */}
          </section>
        </article>
      </main>

      {/* Sidebar */}
      <aside className="bg-neutral-100 p-md" aria-label="Sidebar">
        {/* Sidebar content */}
      </aside>

      {/* Footer */}
      <footer className="bg-neutral-900 text-white py-lg px-md">
        <p>&copy; 2026 Grants Portal</p>
      </footer>
    </div>
  );
}
```

### 6.3 ARIA Attributes

```typescript
// Form with accessible input
export function SearchForm() {
  const [query, setQuery] = useState('');

  return (
    <form role="search" onSubmit={(e) => e.preventDefault()}>
      <label htmlFor="search-input" className="block text-sm font-medium mb-2">
        Search grants
      </label>
      <input
        id="search-input"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="e.g., technology, €50k"
        aria-describedby="search-hint"
        aria-autocomplete="list"
        className="w-full px-md py-2 border rounded-lg"
      />
      <small id="search-hint" className="text-neutral-600">
        Press Enter to search, Escape to clear
      </small>
    </form>
  );
}

// Modal with accessibility
export function Modal({ open, onClose, title, children }: ModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center"
      role="presentation"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-white rounded-lg p-lg max-w-md"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <h2 id="modal-title" className="text-2xl font-bold mb-md">
          {title}
        </h2>
        {children}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="ml-auto text-neutral-600 hover:text-neutral-900"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
```

---

## 7. Responsive Design (Mobile-First)

### 7.1 Tailwind Breakpoints

```
xs: 0px (default, mobile)
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

### 7.2 Mobile-First Pattern

```typescript
// Start with mobile styles, then override for larger screens
export function Dashboard() {
  return (
    <div className="grid grid-cols-1 gap-md md:grid-cols-2 lg:grid-cols-3">
      {/* Layout: 1 column mobile, 2 columns tablet, 3 columns desktop */}
      {/* Default: 1 column (xs) */}
      {/* md: breakpoint: 2 columns (768px+) */}
      {/* lg: breakpoint: 3 columns (1024px+) */}
    </div>
  );
}
```

### 7.3 Touch-Friendly Targets

```typescript
// Buttons/interactive elements: min 44x44px (WCAG 2.1 AA)
export function IconButton() {
  return (
    <button
      className="inline-flex items-center justify-center w-11 h-11 rounded-lg hover:bg-neutral-100"
      aria-label="Add new grant"
    >
      {/* Icon */}
    </button>
  );
}
```

---

## 8. Performance Optimization

### 8.1 Code Splitting & Dynamic Imports

```typescript
// pages/dashboard.tsx

import { lazy, Suspense } from 'react';

const ExpensiveComponent = lazy(() => import('@/components/ExpensiveComponent'));

export default function Dashboard() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ExpensiveComponent />
    </Suspense>
  );
}
```

### 8.2 Image Optimization

```typescript
import Image from 'next/image';

export function GrantCard({ grant }: { grant: Grant }) {
  return (
    <div className="rounded-lg overflow-hidden">
      <Image
        src={grant.image}
        alt={grant.title}
        width={400}
        height={300}
        placeholder="blur"
        priority={false}
      />
    </div>
  );
}
```

### 8.3 React Optimization

```typescript
import { memo, useCallback, useMemo } from 'react';

// Memoize expensive components
export const GrantList = memo(function GrantList({ grants }: Props) {
  return (
    <div>
      {grants.map((grant) => (
        <GrantCard key={grant.id} grant={grant} />
      ))}
    </div>
  );
});

// Memoize callbacks
export function SearchFilter({ onSearch }: Props) {
  const handleSearch = useCallback((query: string) => {
    onSearch(query);
  }, [onSearch]);

  return <SearchBox onSearch={handleSearch} />;
}

// Memoize computed values
export function GrantStats({ grants }: Props) {
  const totalAmount = useMemo(
    () => grants.reduce((sum, g) => sum + g.amount, 0),
    [grants]
  );

  return <div>Total: €{totalAmount.toLocaleString()}</div>;
}
```

---

## 9. Testing Frontend

### 9.1 Component Unit Tests

```typescript
// __tests__/Button.test.tsx

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/atoms/Button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>Click</Button>);
    await user.click(screen.getByText('Click'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('meets accessibility requirements', () => {
    const { container } = render(<Button>Click</Button>);
    const button = container.querySelector('button');
    expect(button).toHaveFocus();
  });
});
```

### 9.2 Form Integration Tests

```typescript
// __tests__/LoginForm.test.tsx

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '@/components/organisms/LoginForm';
import * as authApi from '@/services/auth.api';

jest.mock('@/services/auth.api');

describe('LoginForm Integration', () => {
  it('submits form with valid credentials', async () => {
    const user = userEvent.setup();
    (authApi.login as jest.Mock).mockResolvedValue({
      token: 'mock-token',
    });

    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), 'user@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'password123',
      });
    });
  });
});
```

---

## 10. Ejemplos Completos

### 10.1 Página Completa (Dashboard)

```typescript
// src/app/dashboard/page.tsx

'use client';

import { useQuery } from '@tanstack/react-query';
import { GrantsList } from '@/components/organisms/GrantsList';
import { SearchFilter } from '@/components/molecules/SearchFilter';
import { LoadingSpinner } from '@/components/atoms/LoadingSpinner';
import { ErrorAlert } from '@/components/atoms/ErrorAlert';
import { fetchGrants } from '@/services/grants.api';

export default function DashboardPage() {
  const [query, setQuery] = useState('');
  const {
    data: grants,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['grants', query],
    queryFn: () => fetchGrants(query),
  });

  return (
    <main className="min-h-screen bg-neutral-50 py-lg px-md">
      <div className="max-w-5xl mx-auto space-y-lg">
        {/* Header */}
        <header>
          <h1 className="text-4xl font-bold text-neutral-900 mb-2">
            Available Grants
          </h1>
          <p className="text-lg text-neutral-600">
            Find and track public funding opportunities
          </p>
        </header>

        {/* Search Filter */}
        <SearchFilter value={query} onChange={setQuery} />

        {/* Results */}
        {isLoading && <LoadingSpinner />}
        {error && <ErrorAlert error={error} />}
        {grants && <GrantsList grants={grants} />}
      </div>
    </main>
  );
}
```

### 10.2 Component Library (Storybook)

```typescript
// src/components/atoms/Button/Button.stories.tsx

import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta = {
  title: 'Atoms/Button',
  component: Button,
  args: {
    children: 'Click me',
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { variant: 'primary' },
};

export const Secondary: Story = {
  args: { variant: 'secondary' },
};

export const Disabled: Story = {
  args: { variant: 'primary', disabled: true },
};

export const Loading: Story = {
  args: { variant: 'primary', isLoading: true },
};
```

---

## Summary

| Aspecto | Standard | Tool |
|---------|----------|------|
| **Styling** | Tailwind CSS | 100% utilities |
| **Design Tokens** | tailwind.config.js | Centralized source |
| **Components** | Atomic Design | Atoms → Molecules → Organisms |
| **Accessibility** | WCAG 2.1 AA | Testing library, axe-core |
| **Responsive** | Mobile-first | Tailwind breakpoints |
| **Performance** | <300KB gzipped | Code splitting, Image optimization |
| **Testing** | >70% coverage | Jest, RTL, Playwright |
| **Dark Mode** | Supported | CSS variables via `data-theme` |

**Go-Live requires:** All design tokens used, components tested, a11y validated, responsive on mobile/tablet/desktop

---

**Última actualización:** 2026-01-27
**Versión:** 1.0
**Status:** OBLIGATORIO desde Sprint 0
