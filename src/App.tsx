import { useEffect, useState } from 'react';
import { HomeScreen } from './components/home/HomeScreen';
import { GameScreen } from './components/game/GameScreen';
import { StatsScreen } from './components/stats/StatsScreen';
import { PwaStatus } from './components/common/PwaStatus';
import { useSettingsStore } from './store/useSettingsStore';
import { useGameStore } from './store/useGameStore';

type View = 'home' | 'game' | 'stats';

function App() {
  const [view, setView] = useState<View>('home');
  const theme = useSettingsStore((state) => state.theme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const handleSelectLevel = (levelId: number) => {
    const { getSavedLevelId, resumeSavedGame, startNewGame } = useGameStore.getState();
    if (getSavedLevelId() === levelId) {
      resumeSavedGame();
    } else {
      startNewGame(levelId);
    }
    setView('game');
  };

  const handleBack = () => {
    const { isComplete, isPaused, togglePause } = useGameStore.getState();
    if (!isComplete && !isPaused) togglePause();
    setView('home');
  };

  return (
    <>
      <PwaStatus />
      <div key={view} className="animate-view-in">
        {view === 'home' && (
          <HomeScreen onSelectLevel={handleSelectLevel} onOpenStats={() => setView('stats')} />
        )}
        {view === 'game' && (
          <GameScreen onBack={handleBack} onSelectLevel={handleSelectLevel} onOpenStats={() => setView('stats')} />
        )}
        {view === 'stats' && <StatsScreen onBack={() => setView('home')} />}
      </div>
    </>
  );
}

export default App;
