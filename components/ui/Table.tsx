import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

export function Table({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('overflow-x-auto rounded-xl border border-[#334155]', className)}>
      <table className="min-w-full divide-y divide-[#334155]">{children}</table>
    </div>
  );
}

export function Thead({ children }: { children: ReactNode }) {
  return <thead className="bg-[#0f172a]">{children}</thead>;
}

export function Tbody({ children }: { children: ReactNode }) {
  return <tbody className="bg-[#1e293b] divide-y divide-[#334155]">{children}</tbody>;
}

export function Th({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <th className={cn('px-4 py-3 text-left text-xs font-semibold text-[#94a3b8] uppercase tracking-wider', className)}>
      {children}
    </th>
  );
}

export function Td({ children, className, colSpan }: { children: ReactNode; className?: string; colSpan?: number }) {
  return (
    <td colSpan={colSpan} className={cn('px-4 py-3 text-sm text-[#f1f5f9] whitespace-nowrap', className)}>
      {children}
    </td>
  );
}
