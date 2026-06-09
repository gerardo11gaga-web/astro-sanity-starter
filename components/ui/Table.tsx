import { cn } from '@/lib/utils';
import { ReactNode } from 'react';
import React from 'react';

export function Table({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('overflow-x-auto rounded-xl border border-[#E2D9CF]', className)}
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <table className="min-w-full divide-y divide-[#E2D9CF]">{children}</table>
    </div>
  );
}

export function Thead({ children }: { children: ReactNode }) {
  return <thead className="bg-[#F7F3EE]">{children}</thead>;
}

export function Tbody({ children }: { children: ReactNode }) {
  return <tbody className="bg-white divide-y divide-[#E2D9CF]">{children}</tbody>;
}

export function Th({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <th className={cn('px-4 py-3 text-left text-xs font-semibold text-[#78716C] uppercase tracking-wider', className)}>
      {children}
    </th>
  );
}

export function Td({ children, className, colSpan, style }: { children: ReactNode; className?: string; colSpan?: number; style?: React.CSSProperties }) {
  return (
    <td colSpan={colSpan} style={style} className={cn('px-4 py-3 text-sm text-[#1C1917] whitespace-nowrap', className)}>
      {children}
    </td>
  );
}
