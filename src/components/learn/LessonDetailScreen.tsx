import { useState } from 'react';
import { ArrowLeft, CheckCircle2, XCircle, Lightbulb } from 'lucide-react';
import { getLesson, type CellPos } from '../../lib/lessons';
import { useLearnStore } from '../../store/useLearnStore';
import { useT } from '../../lib/i18n';
import { Button } from '../common/Button';
import { LessonGrid } from './LessonGrid';
import { cn } from '../../lib/utils';

interface LessonDetailScreenProps {
  lessonId: string;
  onBack: () => void;
}

function includesCell(cells: CellPos[], target: CellPos) {
  return cells.some(([r, c]) => r === target[0] && c === target[1]);
}

export function LessonDetailScreen({ lessonId, onBack }: LessonDetailScreenProps) {
  const t = useT();
  const markLessonComplete = useLearnStore((state) => state.markLessonComplete);
  const lesson = getLesson(lessonId);

  const [selectedCell, setSelectedCell] = useState<CellPos | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);

  if (!lesson) return null;

  const handlePracticeClick = (row: number, col: number) => {
    if (feedback === 'correct') return;
    const cell: CellPos = [row, col];
    setSelectedCell(cell);
    const correct = includesCell(lesson.practice.correctCells, cell);
    setFeedback(correct ? 'correct' : 'incorrect');
    if (correct) markLessonComplete(lesson.id);
  };

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
              {t(`learn.lesson.${lesson.id}.title`)}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t(`learn.lesson.${lesson.id}.tagline`)}</p>
          </div>
        </header>

        <section className="mb-6 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80 dark:bg-slate-800/60 dark:ring-slate-700/60 sm:p-5">
          <h2 className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            <Lightbulb size={13} /> {t('learn.section.why')}
          </h2>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {t(`learn.lesson.${lesson.id}.explanation`)}
          </p>
        </section>

        <section className="mb-6 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80 dark:bg-slate-800/60 dark:ring-slate-700/60 sm:p-5">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            {t('learn.section.example')}
          </h2>
          <LessonGrid board={lesson.example} revealAnswer />
          <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-brand-200 dark:bg-brand-500/30" /> {t('learn.legend.pattern')}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-amber-200 dark:bg-amber-500/30" /> {t('learn.legend.result')}
            </span>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80 dark:bg-slate-800/60 dark:ring-slate-700/60 sm:p-5">
          <h2 className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            {t('learn.section.practice')}
          </h2>
          <p className="mb-3 text-sm text-slate-600 dark:text-slate-300">
            {t(`learn.lesson.${lesson.id}.practicePrompt`)}
          </p>
          <LessonGrid
            board={lesson.practice}
            interactive={feedback !== 'correct'}
            selectedCell={selectedCell}
            feedback={feedback}
            onCellClick={handlePracticeClick}
          />

          {feedback && (
            <div
              className={cn(
                'mt-4 flex items-center gap-2.5 rounded-2xl p-3.5 text-sm font-medium animate-fade-up',
                feedback === 'correct'
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                  : 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400',
              )}
            >
              {feedback === 'correct' ? <CheckCircle2 size={18} className="shrink-0" /> : <XCircle size={18} className="shrink-0" />}
              {feedback === 'correct' ? t('learn.practice.correct') : t('learn.practice.incorrect')}
            </div>
          )}

          {feedback === 'correct' && (
            <Button variant="primary" size="lg" onClick={onBack} className="mt-4 w-full">
              {t('learn.practice.finish')}
            </Button>
          )}
        </section>
      </div>
    </div>
  );
}
