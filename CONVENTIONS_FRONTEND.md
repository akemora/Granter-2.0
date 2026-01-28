# 🎨 CONVENTIONS_FRONTEND.md - Frontend Code Style Guide

**For GRANTER v2 Frontend (Next.js 16 + React 19 + Tailwind CSS)** | Effective: Feb 3, 2026 | v1.0

---

## 📋 Table of Contents

1. [General Principles](#general-principles)
2. [File Organization](#file-organization)
3. [Component Conventions](#component-conventions)
4. [Styling Conventions](#styling-conventions)
5. [Hook Conventions](#hook-conventions)
6. [API Integration](#api-integration)
7. [Testing Conventions](#testing-conventions)
8. [Accessibility](#accessibility)
9. [Performance](#performance)

---

## 🎯 General Principles

### Design Tokens First
```
✅ DO:
   - Define colors in Tailwind config
   - Use semantic naming: primary, success, error
   - Centralize all design decisions
   - Use Tailwind utilities everywhere

❌ DON'T:
   - Hardcode colors in components
   - Use inline styles
   - Create local CSS files
   - Invent new color names
```

### Atomic Design Pattern
```
├── Atoms (smallest)
│   └── Button, Input, Label, Badge
├── Molecules (combinations)
│   └── InputField, SearchBox, Card
├── Organisms (sections)
│   └── Header, Sidebar, FormSection
└── Templates (layouts)
    └── DashboardLayout, AuthLayout
```

### Component Responsibility
```
✅ ONE COMPONENT = ONE RESPONSIBILITY

Examples:
   ✅ LoginForm (just login logic)
   ❌ AuthForm (login + signup + recovery)

   ✅ UserCard (display one user)
   ❌ UserSection (display + edit + delete)

   ✅ GrantList (list with filtering)
   ❌ GrantManagement (list + create + edit)
```

---

## 📁 File Organization

### Directory Structure

```
apps/web-frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx          (Root layout)
│   │   ├── page.tsx            (Home page)
│   │   ├── globals.css         (Global styles)
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   └── (dashboard)/
│   │       ├── layout.tsx
│   │       ├── page.tsx
│   │       ├── grants/
│   │       │   ├── page.tsx
│   │       │   └── [id]/
│   │       │       └── page.tsx
│   │       └── sources/
│   │           ├── page.tsx
│   │           └── [id]/
│   │               └── page.tsx
│   │
│   ├── components/
│   │   ├── atoms/              (Smallest components)
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Label.tsx
│   │   │   └── Badge.tsx
│   │   │
│   │   ├── molecules/          (Combinations of atoms)
│   │   │   ├── InputField.tsx
│   │   │   ├── SearchBox.tsx
│   │   │   ├── Card.tsx
│   │   │   └── Modal.tsx
│   │   │
│   │   ├── organisms/          (Sections)
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── GrantList.tsx
│   │   │   └── SourceForm.tsx
│   │   │
│   │   └── templates/          (Full page templates)
│   │       ├── AuthLayout.tsx
│   │       ├── DashboardLayout.tsx
│   │       └── AdminLayout.tsx
│   │
│   ├── hooks/                  (Custom React hooks)
│   │   ├── useAuth.ts
│   │   ├── useGrants.ts
│   │   ├── useSources.ts
│   │   └── useForm.ts
│   │
│   ├── services/               (API client)
│   │   ├── api.ts              (Base client)
│   │   ├── auth.service.ts
│   │   ├── grants.service.ts
│   │   └── sources.service.ts
│   │
│   ├── stores/                 (State management)
│   │   ├── authStore.ts        (Zustand/Context)
│   │   ├── grantsStore.ts
│   │   └── sourceStore.ts
│   │
│   ├── utils/                  (Helper functions)
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   ├── constants.ts
│   │   └── helpers.ts
│   │
│   ├── types/                  (TypeScript types)
│   │   ├── index.ts
│   │   ├── api.types.ts
│   │   └── domain.types.ts
│   │
│   └── config/
│       ├── tailwind.config.ts
│       ├── constants.ts
│       └── environment.ts
│
├── __tests__/
│   ├── components/
│   │   ├── Button.test.tsx
│   │   ├── LoginForm.test.tsx
│   │   └── GrantList.test.tsx
│   └── hooks/
│       ├── useAuth.test.ts
│       └── useGrants.test.ts
│
├── .env.local
├── .env.example
├── package.json
└── tsconfig.json
```

### File Naming Conventions

```
✅ Components:       PascalCase
   LoginForm.tsx, UserCard.tsx, GrantList.tsx

✅ Hooks:            camelCase with "use" prefix
   useAuth.ts, useGrants.ts, useForm.ts

✅ Services:         camelCase with ".service" suffix
   auth.service.ts, grants.service.ts

✅ Utilities:        camelCase
   formatters.ts, validators.ts

✅ Types:            PascalCase
   User, Grant, Source (types/index.ts)

✅ Stores:           camelCase with "Store" suffix
   authStore.ts, grantsStore.ts

✅ Tests:            [filename].test.tsx or .test.ts
   Button.test.tsx, useAuth.test.ts
```

---

## 🧩 Component Conventions

### Functional Component Pattern

```typescript
// ✅ CORRECT PATTERN

import { ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
}

export function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  children,
  className,
}: ButtonProps) {
  const baseStyles = 'font-semibold rounded-lg transition-colors';
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 disabled:bg-gray-100',
    danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-400',
  };
  const sizes = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
```

### Component with State and Effects

```typescript
// ✅ CORRECT PATTERN

import { useState, useEffect } from 'react';
import { Grant } from '@/types';
import { grantsService } from '@/services';
import { GrantCard } from './GrantCard';

interface GrantListProps {
  status?: 'active' | 'closed' | 'all';
  onSelectGrant?: (grant: Grant) => void;
}

export function GrantList({ status = 'all', onSelectGrant }: GrantListProps) {
  const [grants, setGrants] = useState<Grant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGrants = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await grantsService.getGrants({
          status: status === 'all' ? undefined : status,
          limit: 100,
        });
        setGrants(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load grants');
      } finally {
        setLoading(false);
      }
    };

    fetchGrants();
  }, [status]);

  if (loading) return <div className="text-center py-4">Loading...</div>;
  if (error) return <div className="text-red-600 py-4">{error}</div>;
  if (grants.length === 0) return <div className="text-gray-500 py-4">No grants</div>;

  return (
    <div className="grid gap-4">
      {grants.map((grant) => (
        <GrantCard
          key={grant.id}
          grant={grant}
          onClick={() => onSelectGrant?.(grant)}
        />
      ))}
    </div>
  );
}
```

### Form Component Pattern

```typescript
// ✅ CORRECT PATTERN

import { ChangeEvent, FormEvent, useState } from 'react';
import { validateEmail, validatePassword } from '@/utils/validators';
import { InputField } from '@/components/molecules';
import { Button } from '@/components/atoms';

interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
  isLoading?: boolean;
}

export function LoginForm({ onSubmit, isLoading = false }: LoginFormProps) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    // Validate
    if (!validateEmail(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(formData.email, formData.password);
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : 'Login failed',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <InputField
        label="Email"
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
        required
      />

      <InputField
        label="Password"
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
        required
      />

      {errors.submit && (
        <div className="text-red-600 text-sm">{errors.submit}</div>
      )}

      <Button
        type="submit"
        disabled={isSubmitting || isLoading}
        className="w-full"
      >
        {isSubmitting ? 'Logging in...' : 'Login'}
      </Button>
    </form>
  );
}
```

---

## 🎨 Styling Conventions

### Tailwind CSS Usage

```
✅ DO:
   - Use Tailwind utility classes
   - Use cn() helper for conditional classes
   - Define components for repeated styles
   - Use @apply for complex utilities

❌ DON'T:
   - Use inline style prop
   - Create .css files
   - Hardcode colors outside config
   - Use !important
```

### Color System

```typescript
// tailwind.config.ts

export default {
  theme: {
    colors: {
      // Core colors (from design system)
      primary: '#3B82F6',
      secondary: '#6B7280',
      success: '#10B981',
      warning: '#F59E0B',
      danger: '#EF4444',
      info: '#0EA5E9',

      // Neutrals
      white: '#FFFFFF',
      black: '#000000',
      gray: {
        50: '#F9FAFB',
        100: '#F3F4F6',
        200: '#E5E7EB',
        300: '#D1D5DB',
        400: '#9CA3AF',
        500: '#6B7280',
        600: '#4B5563',
        700: '#374151',
        800: '#1F2937',
        900: '#111827',
      },
    },
  },
};

// In components:
<button className="bg-primary text-white hover:bg-blue-700" />
<div className="bg-success/10 text-success" /> // With opacity
```

### Component Styling Pattern

```typescript
// ✅ CORRECT PATTERN

import { cn } from '@/utils/cn';

interface CardProps {
  variant?: 'default' | 'elevated' | 'outlined';
  className?: string;
  children: ReactNode;
}

export function Card({ variant = 'default', className, children }: CardProps) {
  const baseStyles = 'rounded-lg p-4';
  const variants = {
    default: 'bg-white border border-gray-200',
    elevated: 'bg-white shadow-md',
    outlined: 'border-2 border-primary bg-transparent',
  };

  return (
    <div className={cn(baseStyles, variants[variant], className)}>
      {children}
    </div>
  );
}

// Usage:
<Card variant="elevated" className="max-w-md" />
```

---

## 🪝 Hook Conventions

### useAuth Hook

```typescript
// ✅ CORRECT PATTERN

import { useContext, useCallback } from 'react';
import { AuthContext } from '@/stores/authStore';

interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterDto) => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}

// Usage:
const { user, login, isLoading } = useAuth();
```

### useFetch Hook

```typescript
// ✅ CORRECT PATTERN

import { useState, useEffect, useCallback } from 'react';

interface UseFetchOptions {
  skip?: boolean;
}

interface UseFetchReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useFetch<T>(
  url: string,
  options: UseFetchOptions = {},
): UseFetchReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(!options.skip);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchApi<T>(url);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    if (!options.skip) {
      fetch();
    }
  }, [fetch, options.skip]);

  return { data, loading, error, refetch: fetch };
}

// Usage:
const { data: grants, loading, error, refetch } = useFetch('/api/grants');
```

### useForm Hook

```typescript
// ✅ CORRECT PATTERN

import { ChangeEvent, useCallback, useState } from 'react';

interface UseFormReturn<T> {
  values: T;
  errors: Record<keyof T, string>;
  touched: Record<keyof T, boolean>;
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  resetForm: () => void;
  setFieldValue: (field: keyof T, value: any) => void;
}

export function useForm<T extends Record<string, any>>(
  initialValues: T,
  onSubmit?: (values: T) => Promise<void>,
): UseFormReturn<T> {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Record<keyof T, string>>({});
  const [touched, setTouched] = useState<Record<keyof T, boolean>>({});

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  }, []);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  const setFieldValue = useCallback((field: keyof T, value: any) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  }, []);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    resetForm,
    setFieldValue,
  };
}

// Usage:
const { values, handleChange, handleBlur } = useForm({
  email: '',
  password: '',
});
```

---

## 📡 API Integration

### API Service Pattern

```typescript
// ✅ CORRECT PATTERN: src/services/api.ts

interface ApiResponse<T> {
  data: T;
  meta: {
    timestamp: string;
    version: string;
  };
}

interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Array<{ field: string; message: string }>;
  };
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_API_URL) {
    this.baseUrl = baseUrl || 'http://localhost:3001/api';
  }

  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    path: string,
    options?: RequestInit,
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const token = localStorage.getItem('token');

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = (await response.json()) as ApiError;
      throw new Error(error.error.message);
    }

    const result = await response.json();
    return result.data;
  }

  get<T>(path: string): Promise<T> {
    return this.request<T>('GET', path);
  }

  post<T>(path: string, data: unknown): Promise<T> {
    return this.request<T>('POST', path, { body: JSON.stringify(data) });
  }

  put<T>(path: string, data: unknown): Promise<T> {
    return this.request<T>('PUT', path, { body: JSON.stringify(data) });
  }

  delete<T>(path: string): Promise<T> {
    return this.request<T>('DELETE', path);
  }
}

export const apiClient = new ApiClient();
```

### Service Integration

```typescript
// ✅ CORRECT PATTERN: src/services/grants.service.ts

import { apiClient } from './api';
import { Grant, CreateGrantDto, UpdateGrantDto } from '@/types';

export const grantsService = {
  async getGrants(params?: { status?: string; limit?: number }): Promise<Grant[]> {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.limit) query.append('limit', params.limit.toString());

    return apiClient.get(`/grants?${query.toString()}`);
  },

  async getGrantById(id: string): Promise<Grant> {
    return apiClient.get(`/grants/${id}`);
  },

  async createGrant(data: CreateGrantDto): Promise<Grant> {
    return apiClient.post('/grants', data);
  },

  async updateGrant(id: string, data: UpdateGrantDto): Promise<Grant> {
    return apiClient.put(`/grants/${id}`, data);
  },

  async deleteGrant(id: string): Promise<void> {
    return apiClient.delete(`/grants/${id}`);
  },
};
```

---

## 🧪 Testing Conventions

### Component Testing Pattern

```typescript
// ✅ CORRECT PATTERN: __tests__/components/Button.test.tsx

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/atoms/Button';

describe('Button', () => {
  it('renders with children text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);

    await userEvent.click(screen.getByText('Click'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies variant styles', () => {
    render(<Button variant="danger">Delete</Button>);
    const button = screen.getByText('Delete');
    expect(button).toHaveClass('bg-red-600');
  });

  it('disables when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByText('Disabled')).toBeDisabled();
  });
});
```

### Hook Testing Pattern

```typescript
// ✅ CORRECT PATTERN: __tests__/hooks/useAuth.test.ts

import { renderHook, act } from '@testing-library/react';
import { useAuth } from '@/hooks/useAuth';
import * as authService from '@/services/auth.service';

jest.mock('@/services/auth.service');

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with null user', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.user).toBeNull();
  });

  it('login updates user', async () => {
    const mockUser = { id: '1', email: 'test@example.com' };
    jest.spyOn(authService, 'login').mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login('test@example.com', 'password');
    });

    expect(result.current.user).toEqual(mockUser);
  });

  it('logout clears user', async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.user).toBeNull();
  });
});
```

---

## ♿ Accessibility (a11y)

### WCAG 2.1 AA Requirements

```
✅ DO:
   - Use semantic HTML (button, a, form, input)
   - Add aria-labels to icon buttons
   - Use proper heading hierarchy (h1 > h2 > h3)
   - Add alt text to images
   - Ensure 4.5:1 color contrast ratio
   - Support keyboard navigation
   - Use role attributes when needed

❌ DON'T:
   - Use divs as buttons
   - Skip labels on inputs
   - Use color alone to convey meaning
   - Forget focus states
   - Use autoplay on videos
```

### Accessible Component Example

```typescript
// ✅ CORRECT PATTERN

import { useState } from 'react';

interface AccessibleButtonProps {
  onClick: () => void;
  ariaLabel?: string;
  disabled?: boolean;
  children: ReactNode;
}

export function AccessibleButton({
  onClick,
  ariaLabel,
  disabled,
  children,
}: AccessibleButtonProps) {
  const [focused, setFocused] = useState(false);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      className={`
        px-4 py-2 rounded-lg
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        ${focused ? 'ring-2 ring-offset-2 ring-blue-500' : ''}
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
    >
      {children}
    </button>
  );
}
```

### Form Accessibility

```typescript
// ✅ CORRECT PATTERN

export function AccessibleForm() {
  return (
    <form>
      <div className="space-y-4">
        {/* Label linked to input */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            Email *
          </label>
          <input
            id="email"
            type="email"
            required
            aria-required="true"
            aria-label="Email address"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        {/* Error message linked to input */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium">
            Password *
          </label>
          <input
            id="password"
            type="password"
            required
            aria-required="true"
            aria-describedby="password-error"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
          <span id="password-error" className="text-red-600 text-sm">
            Password must be at least 8 characters
          </span>
        </div>
      </div>
    </form>
  );
}
```

---

## ⚡ Performance

### Code Splitting

```typescript
// ✅ DO: Use dynamic imports for large components

import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('@/components/Heavy'), {
  loading: () => <div>Loading...</div>,
});

export default function Page() {
  return <HeavyComponent />;
}
```

### Image Optimization

```typescript
// ✅ DO: Use Next.js Image component

import Image from 'next/image';

export function UserAvatar({ src, alt }: { src: string; alt: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={40}
      height={40}
      className="rounded-full"
    />
  );
}
```

### Memoization

```typescript
// ✅ DO: Use React.memo for expensive components

import { memo } from 'react';

interface GrantCardProps {
  grant: Grant;
  onClick: () => void;
}

export const GrantCard = memo(function GrantCard({
  grant,
  onClick,
}: GrantCardProps) {
  return (
    <div onClick={onClick}>
      <h3>{grant.title}</h3>
      <p>{grant.description}</p>
    </div>
  );
});
```

### Performance Checklist

```
✅ Lighthouse Performance > 90
✅ First Contentful Paint < 2s
✅ Largest Contentful Paint < 2.5s
✅ Cumulative Layout Shift < 0.1
✅ No unnecessary re-renders
✅ Images optimized
✅ Code splitting implemented
✅ Bundle size < 200KB (initial)
```

---

## ✅ Pre-Development Checklist

Before starting work on a component:

```
[ ] Read this document (CONVENTIONS_FRONTEND.md)
[ ] Check component hierarchy (where does it fit?)
[ ] Review existing similar components
[ ] Understand API requirements
[ ] Plan tests (what should we test?)
[ ] Check accessibility requirements
[ ] Use Tailwind only (no CSS files)
[ ] Follow naming conventions
[ ] Add TypeScript types
[ ] Write tests (> 70% coverage)
```

---

**Questions or clarifications?** → Escalate via Orchestrator

🚀 **Build fast, accessible, and beautiful UIs!**
