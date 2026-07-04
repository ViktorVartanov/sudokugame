import { Header } from '../layout/Header';
import { StoryMap } from './StoryMap';
import { AchievementsPanel } from './AchievementsPanel';
import { DailyChallengeCard } from './DailyChallengeCard';
import { LearnEntryCard } from './LearnEntryCard';

interface HomeScreenProps {
  onSelectLevel: (levelId: number) => void;
  onOpenStats: () => void;
  onOpenSettings: () => void;
  onOpenOnline: () => void;
  onPlayDaily: () => void;
  onOpenLearn: () => void;
}

export function HomeScreen({
  onSelectLevel,
  onOpenStats,
  onOpenSettings,
  onOpenOnline,
  onPlayDaily,
  onOpenLearn,
}: HomeScreenProps) {
  return (
    <div className="min-h-screen bg-noise">
      <div className="mx-auto max-w-5xl">
        <Header onOpenStats={onOpenStats} onOpenSettings={onOpenSettings} onOpenOnline={onOpenOnline} />
        <DailyChallengeCard onPlay={onPlayDaily} />
        <LearnEntryCard onOpen={onOpenLearn} />
        <StoryMap onSelectLevel={onSelectLevel} />
        <AchievementsPanel />
      </div>
    </div>
  );
}
