import { Header } from '../layout/Header';
import { StoryMap } from './StoryMap';
import { AchievementsPanel } from './AchievementsPanel';
import { DailyChallengeCard } from './DailyChallengeCard';

interface HomeScreenProps {
  onSelectLevel: (levelId: number) => void;
  onOpenStats: () => void;
  onOpenSettings: () => void;
  onOpenOnline: () => void;
  onPlayDaily: () => void;
}

export function HomeScreen({ onSelectLevel, onOpenStats, onOpenSettings, onOpenOnline, onPlayDaily }: HomeScreenProps) {
  return (
    <div className="min-h-screen bg-noise">
      <div className="mx-auto max-w-5xl">
        <Header onOpenStats={onOpenStats} onOpenSettings={onOpenSettings} onOpenOnline={onOpenOnline} />
        <DailyChallengeCard onPlay={onPlayDaily} />
        <StoryMap onSelectLevel={onSelectLevel} />
        <AchievementsPanel />
      </div>
    </div>
  );
}
