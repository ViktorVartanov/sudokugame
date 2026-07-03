import { useEffect, useLayoutEffect } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useTimer } from '../../hooks/useTimer';
import { useKeyboardInput } from '../../hooks/useKeyboardInput';
import { applyLevelVisual, getStoryWorld } from '../../lib/storyWorlds';
import { applyColorTheme } from '../../lib/themes';
import { playAmbientSound, stopAmbientSound } from '../../lib/ambientSound';
import { cn } from '../../lib/utils';
import { GameHeader } from './GameHeader';
import { GameBoard } from './GameBoard';
import { PauseOverlay } from './PauseOverlay';
import { Toolbar } from './Toolbar';
import { NumberPad } from './NumberPad';
import { VictoryModal } from './VictoryModal';
import { GrandmasterVictory } from './GrandmasterVictory';
import { GameMessageBubble } from './GameMessageBubble';
import { WorldDecorations } from './WorldDecorations';

interface GameScreenProps {
  onBack: () => void;
  onSelectLevel: (levelId: number) => void;
  onOpenStats: () => void;
}

export function GameScreen({ onBack, onSelectLevel, onOpenStats }: GameScreenProps) {
  useTimer();
  useKeyboardInput();

  const levelId = useGameStore((state) => state.levelId);
  const startedAt = useGameStore((state) => state.startedAt);
  const useLevelVisual = useSettingsStore((state) => state.useLevelVisual);
  const colorTheme = useSettingsStore((state) => state.colorTheme);
  const themeSounds = useSettingsStore((state) => state.themeSounds);

  // useLayoutEffect (not useEffect) so the world's colors are applied before
  // the browser paints the first frame — otherwise the screen briefly shows
  // the previous theme, then visibly snaps to the world's colors a moment
  // later once the (post-paint) effect fires, mid-entrance-animation.
  useLayoutEffect(() => {
    if (levelId === null) return;
    if (useLevelVisual) {
      applyLevelVisual(levelId);
      return () => applyColorTheme(colorTheme);
    }
  }, [levelId, useLevelVisual, colorTheme]);

  useEffect(() => {
    if (levelId === null || !useLevelVisual || !themeSounds) return;
    playAmbientSound(getStoryWorld(levelId).ambientProfile);
    return () => stopAmbientSound();
  }, [levelId, useLevelVisual, themeSounds]);

  if (levelId === null) return null;

  const isFinalLevel = levelId === 10;
  const world = getStoryWorld(levelId);

  return (
    <div
      // min-h-screen (not fixed inset-0): this div sits inside App.tsx's
      // `animate-view-in` wrapper, which has an active CSS `transform` for
      // the 400ms the view-transition animation runs. A `position: fixed`
      // descendant of a `transform`ed ancestor is positioned relative to
      // THAT ancestor instead of the viewport — so for exactly the window
      // where the level is entering, this screen's "fixed" positioning was
      // silently anchored to the animating (moving/scaling) wrapper rather
      // than the viewport, which reads as the level "jumping" into place
      // instead of smoothly appearing.
      className={cn('relative min-h-screen flex flex-col overflow-hidden px-4', useLevelVisual ? `motif-${world.motif}` : 'bg-noise')}
      style={{
        paddingTop: 'max(0.5rem, env(safe-area-inset-top))',
        paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))',
        paddingLeft: 'max(1rem, env(safe-area-inset-left))',
        paddingRight: 'max(1rem, env(safe-area-inset-right))',
      }}
    >
      {useLevelVisual && <WorldDecorations world={world} />}

      <div className="shrink-0">
        <GameHeader onBack={onBack} />
      </div>

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 py-1 sm:gap-6 sm:py-4">
        <GameMessageBubble />

        <div
          key={startedAt}
          className="relative mx-auto aspect-square w-full min-h-0 shrink"
          style={{ maxWidth: 'min(92vw, 32rem)', maxHeight: 'min(56dvh, 32rem)' }}
        >
          <GameBoard />
          <PauseOverlay />
        </div>

        <div className="flex w-full shrink-0 flex-col gap-2 sm:gap-4">
          <Toolbar />
          <NumberPad />
        </div>
      </div>

      {isFinalLevel ? (
        <GrandmasterVictory onBack={onBack} onPlayAgain={() => onSelectLevel(levelId)} onViewStats={onOpenStats} />
      ) : (
        <VictoryModal
          onBack={onBack}
          onPlayAgain={() => onSelectLevel(levelId)}
          onNextLevel={() => onSelectLevel(Math.min(levelId + 1, 10))}
        />
      )}
    </div>
  );
}
