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
      className="mx-4 mb-6 flex items-center gap-3.5 rounded-[24px] bg-white p-4 text-left shadow-sm ring-1 ring-slate-200/80 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-[0.99] dark:bg-slate-800/60 dark:ring-slate-700/60 sm:mx-8"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-400 to-violet-600 text-white shadow-sm">
        <GraduationCap size={22} />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">{t('learn.title')}</h3>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          {t('learn.progress', { done: completedCount, total: LESSONS.length })}
        </p>
      </div>
      <ChevronRight size={18} className="shrink-0 text-slate-300 dark:text-slate-600" />
    </button>
  );
}
