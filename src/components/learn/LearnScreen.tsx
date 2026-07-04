import { ArrowLeft, CheckCircle2, ChevronRight, Target, Search, Copy, ArrowRightFromLine, Layers, Grid2x2, type LucideIcon } from 'lucide-react';
import { LESSONS } from '../../lib/lessons';
import { useLearnStore } from '../../store/useLearnStore';
import { useT } from '../../lib/i18n';
import { cn } from '../../lib/utils';

const ICONS: Record<string, LucideIcon> = { Target, Search, Copy, ArrowRightFromLine, Layers, Grid2x2 };

interface LearnScreenProps {
  onBack: () => void;
  onSelectLesson: (id: string) => void;
}

export function LearnScreen({ onBack, onSelectLesson }: LearnScreenProps) {
  const t = useT();
  const completedLessons = useLearnStore((state) => state.completedLessons);

  return (
    <div className="min-h-screen bg-noise">
      <div className="mx-auto max-w-2xl px-4 pb-16 sm:px-8">
        <header className="flex items-center gap-3 py-6 sm:py-8">
          <button
            onClick={onBack}
            aria-label={t('learn.back')}
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm ring-1 ring-slate-200 transition-all hover:bg-slate-50 active:scale-95 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700 dark:hover:bg-slate-700/80"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="font-display text-lg font-bold leading-tight text-slate-900 dark:text-white">
              {t('learn.title')}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t('learn.subtitle')}</p>
          </div>
        </header>

        <div className="mb-5 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200/80 dark:bg-slate-800/60 dark:ring-slate-700/60">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-violet-600 transition-all duration-500 ease-out"
              style={{ width: `${(completedLessons.length / LESSONS.length) * 100}%` }}
            />
          </div>
          <span className="shrink-0 text-xs font-semibold text-slate-500 dark:text-slate-400">
            {t('learn.progress', { done: completedLessons.length, total: LESSONS.length })}
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          {LESSONS.map((lesson) => {
            const Icon = ICONS[lesson.icon] ?? Target;
            const isComplete = completedLessons.includes(lesson.id);
            return (
              <button
                key={lesson.id}
                onClick={() => onSelectLesson(lesson.id)}
                className="group flex items-center gap-3.5 rounded-2xl bg-white p-4 text-left shadow-sm ring-1 ring-slate-200/80 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-[0.99] dark:bg-slate-800/60 dark:ring-slate-700/60"
              >
                <div
                  className={cn(
                    'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-sm',
                    isComplete ? 'from-emerald-400 to-teal-500' : 'from-indigo-400 to-violet-600',
                  )}
                >
                  {isComplete ? <CheckCircle2 size={22} /> : <Icon size={22} />}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                    {t(`learn.lesson.${lesson.id}.title`)}
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    {t(`learn.lesson.${lesson.id}.tagline`)}
                  </p>
                </div>
                <ChevronRight size={18} className="shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 dark:text-slate-600" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
