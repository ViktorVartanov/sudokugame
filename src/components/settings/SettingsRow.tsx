import type { ReactNode } from 'react';

interface SettingsRowProps {
  label: string;
  description?: string;
  control: ReactNode;
  /** Puts the control on its own full-width line below the label instead of
   * beside it — needed for wide controls (like a row of color swatches) that
   * would otherwise squeeze the description text into single-word-per-line
   * wrapping on narrow screens. */
  stacked?: boolean;
}

export function SettingsRow({ label, description, control, stacked }: SettingsRowProps) {
  if (stacked) {
    return (
      <div className="px-5 py-4">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{label}</p>
        {description && <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{description}</p>}
        <div className="mt-3">{control}</div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{label}</p>
        {description && <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{description}</p>}
      </div>
      <div className="flex shrink-0 items-center">{control}</div>
    </div>
  );
}

export function SettingsSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-6">
      <h2 className="mb-2 px-1 text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
        {title}
      </h2>
      <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 dark:divide-slate-700/60 dark:bg-slate-800/60 dark:ring-slate-700/60">
        {children}
      </div>
    </section>
  );
}
