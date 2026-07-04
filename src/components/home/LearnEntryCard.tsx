import { GraduationCap, ChevronRight } from 'lucide-react';
import { LESSONS } from '../../lib/lessons';
import { useLearnStore } from '../../store/useLearnStore';
import { useT } from '../../lib/i18n';

interface LearnEntryCardProps {
  onOpen: () => void;
}

export function LearnEntryCard({ onOpen }: LearnEntryCardProps) {
  const t = useT();
  const completedCount = useLearnStore((state) => state.completedLessons.length);

  return (
    <button
      onClick={onOpen}
      className="mx-4 mb-6 flex items-center gap-3.5 rounded-[24px] border border-slate-200/80 bg-white p-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-200 active:translate-y-0 active:scale-[0.99] dark:border-slate-700/60 dark:bg-slate-800/60 sm:mx-8"
    >
      {/* Outlined icon, not a filled gradient badge — the color comes from
          the stroke, not a saturated square block behind it. */}
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-brand-300 text-brand-600 dark:border-brand-500/40 dark:text-brand-400">
        <GraduationCap size={20} />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">{t('learn.title')}</h3>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          {t('learn.progress', { done: completedCount, total: LESSONS.length })}
        </p>
      </div>
      <ChevronRight size={18} className="shrink-0 text-slate-300 dark:text-slate-600" />
    </button>
  );
}
