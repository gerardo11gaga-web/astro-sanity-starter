import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'pending' | 'approved' | 'denied' | 'draft' | 'published';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants: Record<string, string> = {
    default: 'bg-[#F3F4F6] text-[#374151]',
    success: 'bg-[#DCFCE7] text-[#166534]',
    warning: 'bg-[#FEF3C7] text-[#92400E]',
    danger: 'bg-[#FEE2E2] text-[#991B1B]',
    info: 'bg-[#DBEAFE] text-[#1E40AF]',
    pending: 'bg-[#FEF3C7] text-[#92400E]',
    approved: 'bg-[#DCFCE7] text-[#166534]',
    denied: 'bg-[#FEE2E2] text-[#991B1B]',
    draft: 'bg-[#F3F4F6] text-[#374151]',
    published: 'bg-[#DCFCE7] text-[#166534]',
  };
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', variants[variant] || variants.default, className)}>
      {children}
    </span>
  );
}
