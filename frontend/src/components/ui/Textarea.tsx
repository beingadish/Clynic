import { forwardRef, useId, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const fieldBase =
  'block w-full rounded-lg border-slate-300 bg-white text-slate-900 shadow-sm ' +
  'placeholder:text-slate-400 focus:border-brand-500 focus:ring-brand-500 sm:text-sm';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, className, id, rows = 3, ...props },
  ref,
) {
  const autoId = useId();
  const areaId = id ?? autoId;

  return (
    <div>
      {label ? (
        <label htmlFor={areaId} className="field-label">
          {label}
        </label>
      ) : null}
      <textarea
        ref={ref}
        id={areaId}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${areaId}-error` : undefined}
        className={cn(fieldBase, error && 'border-red-400 focus:border-red-500 focus:ring-red-500', className)}
        {...props}
      />
      {error ? (
        <p id={`${areaId}-error`} className="mt-1 text-xs text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
});
