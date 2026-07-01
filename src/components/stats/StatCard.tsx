import type { CSSProperties, ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  sublabel?: string;
  gradient: string;
  style?: CSSProperties;
}

export function StatCard({ icon, label, value, sublabel, gradient, style }: StatCardProps) {
  return (
    <div
      style={style}
      className="animate-fade-up rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:bg-slate-800/60 dark:ring-slate-700/60"
    >
      <div
        className={cn(
          'flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-md',
          gradient,
        )}
      >
        {icon}
      </div>
      <p className="mt-4 font-display text-2xl font-extrabold text-slate-900 dark:text-white">{value}</p>
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
      {sublabel && <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">{sublabel}</p>}
    </div>
  );
}
