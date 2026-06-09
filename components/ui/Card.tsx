import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={cn('bg-[#1e293b] rounded-xl border border-[#334155] shadow-sm', className)}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: CardProps) {
  return <div className={cn('px-6 py-4 border-b border-[#334155]', className)}>{children}</div>;
}

export function CardBody({ children, className }: CardProps) {
  return <div className={cn('px-6 py-4', className)}>{children}</div>;
}
