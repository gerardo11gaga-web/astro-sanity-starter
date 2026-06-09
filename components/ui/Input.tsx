import { cn } from '@/lib/utils';
import { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-[#78716C]">{label}</label>}
      <input
        ref={ref}
        className={cn(
          'w-full px-3 py-2.5 border rounded-lg text-sm transition-colors bg-white text-[#1C1917]',
          'border-[#E2D9CF] focus:border-[#9B2335] focus:ring-2 focus:ring-[#9B2335]/15 outline-none placeholder-[#A8A29E]',
          error && 'border-[#9B2335]',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-[#9B2335]">{error}</p>}
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
      {label && <label className="text-sm font-medium text-[#78716C]">{label}</label>}
      <select
        ref={ref}
        className={cn(
          'w-full px-3 py-2.5 border rounded-lg text-sm transition-colors bg-white text-[#1C1917]',
          'border-[#E2D9CF] focus:border-[#9B2335] focus:ring-2 focus:ring-[#9B2335]/15 outline-none',
          error && 'border-[#9B2335]',
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-[#9B2335]">{error}</p>}
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
      {label && <label className="text-sm font-medium text-[#78716C]">{label}</label>}
      <textarea
        ref={ref}
        className={cn(
          'w-full px-3 py-2.5 border rounded-lg text-sm transition-colors resize-none bg-white text-[#1C1917]',
          'border-[#E2D9CF] focus:border-[#9B2335] focus:ring-2 focus:ring-[#9B2335]/15 outline-none placeholder-[#A8A29E]',
          error && 'border-[#9B2335]',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-[#9B2335]">{error}</p>}
    </div>
  )
);
Textarea.displayName = 'Textarea';
