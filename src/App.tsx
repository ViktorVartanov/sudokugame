import { useEffect, useLayoutEffect, useState } from 'react';
import { HomeScreen } from './components/home/HomeScreen';
import { GameScreen } from './components/game/GameScreen';
import { StatsScreen } from './components/stats/StatsScreen';
import { SettingsScreen } from './components/settings/SettingsScreen';
import { OnlineScreen } from './components/online/OnlineScreen';
import { BattleInviteScreen } from './components/online/BattleInviteScreen';
import { ResultScreen } from './components/online/ResultScreen';
import { LearnScreen } from './components/learn/LearnScreen';
import { LessonDetailScreen } from './components/learn/LessonDetailScreen';
import { PwaStatus } from './components/common/PwaStatus';
import { useSettingsStore } from './store/useSettingsStore';
import { useGameStore } from './store/useGameStore';
import { useProgressStore } from './store/useProgressStore';
import { applyColorTheme } from './lib/themes';
import { isLevelUnlocked } from './lib/storyWorlds';
import { parseCurrentRoute, clearRouteFromUrl } from './lib/deepLinks';
import { getTodayDateString } from './lib/dailyChallenge';

type View = 'home' | 'game' | 'stats' | 'settings' | 'online' | 'battle-invite' | 'result' | 'learn' | 'lesson';

function App() {
  const [route] = useState(() => parseCurrentRoute());
  const [view, setView] = useState<View>(() => {
    if (route.type === 'battle-invite') return 'battle-invite';
    if (route.type === 'result') return 'result';
    return 'home';
  });
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const theme = useSettingsStore((state) => state.theme);
  const colorTheme = useSettingsStore((state) => state.colorTheme);

  useEffect(() => {
    if (route.type !== null) clearRouteFromUrl();
  }, [route]);

  // useLayoutEffect so theme/dark-mode apply before the first paint — otherwise
  // every load briefly flashes the default (unthemed, light) look before
  // snapping to the user's saved preference once the effect runs post-paint.
  useLayoutEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useLayoutEffect(() => {
    applyColorTheme(colorTheme);
  }, [colorTheme]);

  const handleSelectLevel = (levelId: number) => {
    if (!isLevelUnlocked(levelId, useProgressStore.getState().levels)) return;
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

  // The creator's own "Start Game" button after generating a challenge link —
  // there's no backend to know when the friend has actually opened it, so
  // starting together is a manual "ready?" coordinated over chat, then both
  // press play. Uses the exact seed the link was built from.
  const handleStartOwnGame = (levelId: number, seed: number) => {
    useGameStore.getState().startNewGame(levelId, seed);
    setView('game');
  };

  const handlePlayDaily = () => {
    const dateString = getTodayDateString();
    const { getSavedDailyChallengeDate, resumeSavedGame, startDailyChallenge } = useGameStore.getState();
    if (getSavedDailyChallengeDate() === dateString) {
      resumeSavedGame();
    } else {
      startDailyChallenge(dateString);
    }
    setView('game');
  };

  return (
    <>
      <PwaStatus />
      <div key={view} className="animate-view-in">
        {view === 'home' && (
          <HomeScreen
            onSelectLevel={handleSelectLevel}
            onOpenStats={() => setView('stats')}
            onOpenSettings={() => setView('settings')}
            onOpenOnline={() => setView('online')}
            onPlayDaily={handlePlayDaily}
            onOpenLearn={() => setView('learn')}
          />
        )}
        {view === 'game' && (
          <GameScreen onBack={handleBack} onSelectLevel={handleSelectLevel} onOpenStats={() => setView('stats')} />
        )}
        {view === 'stats' && <StatsScreen onBack={() => setView('home')} />}
        {view === 'settings' && <SettingsScreen onBack={() => setView('home')} />}
        {view === 'online' && <OnlineScreen onBack={() => setView('home')} onStartGame={handleStartOwnGame} />}
        {view === 'learn' && (
          <LearnScreen
            onBack={() => setView('home')}
            onSelectLesson={(id) => {
              setSelectedLessonId(id);
              setView('lesson');
            }}
          />
        )}
        {view === 'lesson' && selectedLessonId && (
          <LessonDetailScreen lessonId={selectedLessonId} onBack={() => setView('learn')} />
        )}
        {view === 'battle-invite' && route.type === 'battle-invite' && (
          <BattleInviteScreen
            payload={route.payload}
            onDecline={() => setView('home')}
            onAccepted={() => setView('game')}
          />
        )}
        {view === 'result' && route.type === 'result' && (
          <ResultScreen payload={route.payload} onGoHome={() => setView('home')} onStartGame={() => setView('game')} />
        )}
      </div>
    </>
  );
}

export default App;
