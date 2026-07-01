import { useGameStore } from '../../store/useGameStore';
import { useTimer } from '../../hooks/useTimer';
import { useKeyboardInput } from '../../hooks/useKeyboardInput';
import { GameHeader } from './GameHeader';
import { GameBoard } from './GameBoard';
import { PauseOverlay } from './PauseOverlay';
import { Toolbar } from './Toolbar';
import { NumberPad } from './NumberPad';
import { VictoryModal } from './VictoryModal';
import { GrandmasterVictory } from './GrandmasterVictory';

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

  if (levelId === null) return null;

  const isFinalLevel = levelId === 10;

  return (
    <div className="flex min-h-screen flex-col bg-noise px-4 pb-8">
      <GameHeader onBack={onBack} />

      <div className="flex flex-1 flex-col items-center justify-center gap-6 py-4">
        <div key={startedAt} className="relative mx-auto w-full max-w-[min(92vw,32rem)]">
          <GameBoard />
          <PauseOverlay />
        </div>

        <div className="flex w-full flex-col gap-4">
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
