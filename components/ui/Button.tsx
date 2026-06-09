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
    const base = 'inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed';
    const variants = {
      primary: 'bg-[#9B2335] text-white hover:bg-[#7D1C2A] focus:ring-[#9B2335]',
      secondary: 'bg-white text-[#1C1917] border border-[#E2D9CF] hover:bg-[#F0EAE2] focus:ring-[#E2D9CF]',
      danger: 'bg-[#9B2335] text-white hover:bg-[#7D1C2A] focus:ring-[#9B2335]',
      ghost: 'text-[#78716C] hover:bg-[#F0EAE2] hover:text-[#1C1917] focus:ring-[#E2D9CF]',
      outline: 'border border-[#E2D9CF] text-[#78716C] hover:bg-[#F0EAE2] hover:text-[#1C1917] focus:ring-[#9B2335]',
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
