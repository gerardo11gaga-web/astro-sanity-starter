'use client';
import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center font-medium rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0f172a] disabled:opacity-50 disabled:cursor-not-allowed';
    const variants = {
      primary: 'bg-[#6366f1] text-white hover:bg-[#4f46e5] focus:ring-[#6366f1] shadow-lg shadow-indigo-900/20',
      secondary: 'bg-[#334155] text-[#f1f5f9] hover:bg-[#475569] focus:ring-[#334155]',
      danger: 'bg-[#ef4444] text-white hover:bg-red-600 focus:ring-red-500',
      ghost: 'text-[#94a3b8] hover:bg-[#334155] hover:text-[#f1f5f9] focus:ring-[#334155]',
      outline: 'border border-[#334155] text-[#94a3b8] hover:bg-[#334155] hover:text-[#f1f5f9] focus:ring-[#6366f1]',
    };
    const sizes = {
      sm: 'px-3 py-1.5 text-sm gap-1.5',
      md: 'px-4 py-2 text-sm gap-2',
      lg: 'px-6 py-3 text-base gap-2',
    };
    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
