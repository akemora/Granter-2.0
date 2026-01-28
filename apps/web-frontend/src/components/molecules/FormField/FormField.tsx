import { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  helper?: string;
  children: ReactNode;
}

export function FormField({ label, helper, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">{label}</p>
      <div className="space-y-1">{children}</div>
      {helper && <p className="text-xs text-neutral-400">{helper}</p>}
    </div>
  );
}
