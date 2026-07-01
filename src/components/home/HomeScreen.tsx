import { Header } from '../layout/Header';
import { LevelSelect } from './LevelSelect';
import { AchievementsPanel } from './AchievementsPanel';

interface HomeScreenProps {
  onSelectLevel: (levelId: number) => void;
  onOpenStats: () => void;
}

export function HomeScreen({ onSelectLevel, onOpenStats }: HomeScreenProps) {
  return (
    <div className="min-h-screen bg-noise">
      <div className="mx-auto max-w-5xl">
        <Header onOpenStats={onOpenStats} />
        <LevelSelect onSelectLevel={onSelectLevel} />
        <AchievementsPanel />
      </div>
    </div>
  );
}
