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
  const isDailyChallenge = useGameStore((state) => state.isDailyChallenge);
  const restartPuzzle = useGameStore((state) => state.restartPuzzle);
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

  // Belt-and-suspenders scroll lock: `h-dvh` + `overflow-hidden` on the root
  // below already stops the page from growing taller than the viewport, but
  // iOS Safari can still show a brief rubber-band bounce on a vertical swipe
  // even when there's nothing to actually scroll to. Locking the real
  // document scroller while this screen is mounted rules that out too.
  useEffect(() => {
    const { style } = document.documentElement;
    const previousOverflow = style.overflow;
    const previousOverscroll = style.overscrollBehavior;
    style.overflow = 'hidden';
    style.overscrollBehavior = 'none';
    return () => {
      style.overflow = previousOverflow;
      style.overscrollBehavior = previousOverscroll;
    };
  }, []);

  if (levelId === null) return null;

  // A daily challenge borrows a real level's difficulty/world for variety
  // (see lib/dailyChallenge.ts), so it can land on levelId 10 — guard against
  // that accidentally triggering the whole-campaign Grandmaster ending.
  const isFinalLevel = levelId === 10 && !isDailyChallenge;
  const world = getStoryWorld(levelId);

  return (
    <div
      // Not `fixed`: this div sits inside App.tsx's `animate-view-in`
      // wrapper, which has an active CSS `transform` for the 400ms the
      // view-transition animation runs. A `position: fixed` descendant of
      // a `transform`ed ancestor is positioned relative to THAT ancestor
      // instead of the viewport, which read as the level "jumping" into
      // place instead of smoothly appearing.
      //
      // Not `min-h-screen`: that sets a MINIMUM height, not a cap — when
      // the message bubble expands (coach tips / mistake explanations),
      // the screen's natural content height could exceed the viewport, and
      // with no fixed ceiling the whole PAGE would scroll to reveal it.
      //
      // Not plain `h-dvh` either anymore: `#root` (index.css) already
      // applies `padding: env(safe-area-inset-*)` on every side, once, at
      // the stable top-level container. This element used to ALSO apply
      // its own copy of the same top/bottom safe-area padding on top of
      // that — doubling the effective inset on a notched phone — while
      // still claiming a flat `100dvh` height that has no idea its
      // ancestor already consumed some of that space with padding. On a
      // real notched device that mismatch made the bottom of this screen
      // overflow the actual visible viewport by the doubled amount; with
      // scrolling deliberately locked (see below), that overflow had
      // nowhere consistent to go, which is the most likely explanation
      // for the header intermittently rendering under the notch — a desktop
      // Chrome viewport was never going to reproduce this, since
      // env(safe-area-inset-*) is just 0 there regardless. Height is now
      // 100dvh MINUS whatever #root already consumed via its own top/bottom
      // padding, so there's exactly one source of truth for the safe area,
      // and this element only adds its own small fixed breathing room on
      // top of that (not another copy of the inset itself).
      className={cn('relative flex flex-col overflow-hidden px-4 py-2', useLevelVisual ? `motif-${world.motif}` : 'bg-noise')}
      style={{ height: 'calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom))' }}
    >
      {useLevelVisual && <WorldDecorations world={world} />}

      <div className="shrink-0">
        <GameHeader onBack={onBack} />
      </div>

      {/* Previously this whole [board, toolbar, numberpad] group was centered
          as a block — since header content (world name length, whether the
          level-visual icon shows, etc.) varies per level, that made the
          numberpad sit at a different height each time. Now the board's
          OWN wrapper is `flex-1` (it fills whatever space is actually left
          under the header and centers the board within itself), and the
          toolbar/numberpad follow it in normal flow — so they always end up
          the same fixed distance from the screen bottom, regardless of the
          header, while any leftover space is absorbed around the board
          itself rather than shifting the toolbar/numberpad around. */}
      <div className="relative flex min-h-0 flex-1 flex-col items-center gap-3 py-1 sm:gap-6 sm:py-4">
        {/* Absolutely positioned (out of flex flow) so the board/toolbar below
            are sized identically whether or not a message is showing — a
            coach tip or mistake explanation floats in over the top instead
            of pushing everything else down or (worse) permanently reserving
            space for a message that isn't there most of the time. */}
        <div className="absolute inset-x-0 top-0 z-10 px-0">
          <GameMessageBubble />
        </div>

        <div className="flex min-h-0 w-full flex-1 items-center justify-center">
          <div
            key={startedAt}
            className="relative aspect-square h-full max-h-full w-full"
            style={{ maxWidth: 'min(92vw, 32rem)', maxHeight: 'min(56dvh, 32rem)' }}
          >
            <GameBoard />
            <PauseOverlay />
          </div>
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
          // A daily challenge replays the exact same puzzle (to compare
          // times on an identical board) instead of routing through
          // onSelectLevel, which would both generate a fresh random puzzle
          // and could silently no-op if that day's borrowed difficulty
          // happens to be a level the player hasn't actually unlocked yet.
          onPlayAgain={() => (isDailyChallenge ? restartPuzzle() : onSelectLevel(levelId))}
          onNextLevel={() => onSelectLevel(Math.min(levelId + 1, 10))}
        />
      )}
    </div>
  );
}
