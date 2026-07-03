import { Header } from '../layout/Header';
import { StoryMap } from './StoryMap';
import { AchievementsPanel } from './AchievementsPanel';

interface HomeScreenProps {
  onSelectLevel: (levelId: number) => void;
  onOpenStats: () => void;
  onOpenSettings: () => void;
  onOpenOnline: () => void;
}

export function HomeScreen({ onSelectLevel, onOpenStats, onOpenSettings, onOpenOnline }: HomeScreenProps) {
  return (
    <div className="min-h-screen bg-noise">
      <div className="mx-auto max-w-5xl">
        <Header onOpenStats={onOpenStats} onOpenSettings={onOpenSettings} onOpenOnline={onOpenOnline} />
        <StoryMap onSelectLevel={onSelectLevel} />
        <AchievementsPanel />
      </div>
    </div>
  );
}
