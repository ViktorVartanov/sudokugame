import { useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';

/** Drives the game clock forward once per second while a puzzle is active. */
export function useTimer() {
  const tick = useGameStore((state) => state.tick);
  const isPaused = useGameStore((state) => state.isPaused);
  const isComplete = useGameStore((state) => state.isComplete);

  useEffect(() => {
    if (isPaused || isComplete) return;
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [tick, isPaused, isComplete]);
}
