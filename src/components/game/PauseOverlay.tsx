import { Play } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';

export function PauseOverlay() {
  const isPaused = useGameStore((state) => state.isPaused);
  const isComplete = useGameStore((state) => state.isComplete);
  const togglePause = useGameStore((state) => state.togglePause);

  if (!isPaused || isComplete) return null;

  return (
    <div className="absolute inset-0 z-10 flex animate-fade-in flex-col items-center justify-center gap-4 rounded-2xl bg-white/80 backdrop-blur-md dark:bg-slate-900/85">
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Game paused</p>
      <button
        onClick={togglePause}
        className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-600/30 transition-transform active:scale-90"
        aria-label="Resume game"
      >
        <Play size={26} className="ml-1" />
      </button>
    </div>
  );
}
