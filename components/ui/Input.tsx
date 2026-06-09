import { cn } from '@/lib/utils';
import { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-[#94a3b8]">{label}</label>}
      <input
        ref={ref}
        className={cn(
          'w-full px-3 py-2.5 border rounded-xl text-sm transition-colors bg-[#0f172a] text-[#f1f5f9]',
          'border-[#334155] focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]/20 outline-none placeholder-[#475569]',
          error && 'border-[#ef4444]',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-[#ef4444]">{error}</p>}
    </div>
  )
);
Input.displayName = 'Input';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, children, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-[#94a3b8]">{label}</label>}
      <select
        ref={ref}
        className={cn(
          'w-full px-3 py-2.5 border rounded-xl text-sm transition-colors bg-[#0f172a] text-[#f1f5f9]',
          'border-[#334155] focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]/20 outline-none',
          error && 'border-[#ef4444]',
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-[#ef4444]">{error}</p>}
    </div>
  )
);
Select.displayName = 'Select';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-[#94a3b8]">{label}</label>}
      <textarea
        ref={ref}
        className={cn(
          'w-full px-3 py-2.5 border rounded-xl text-sm transition-colors resize-none bg-[#0f172a] text-[#f1f5f9]',
          'border-[#334155] focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]/20 outline-none placeholder-[#475569]',
          error && 'border-[#ef4444]',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-[#ef4444]">{error}</p>}
    </div>
  )
);
Textarea.displayName = 'Textarea';
