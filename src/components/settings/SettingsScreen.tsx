import { useState } from 'react';
import { ArrowLeft, Wifi, WifiOff } from 'lucide-react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useProgressStore } from '../../store/useProgressStore';
import { useAchievementsStore } from '../../store/useAchievementsStore';
import { useGameStore } from '../../store/useGameStore';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { useT, type Language } from '../../lib/i18n';
import { ThemePicker } from '../common/ThemePicker';
import { Switch } from '../common/Switch';
import { AvatarPicker } from '../common/AvatarPicker';
import { SettingsRow, SettingsSection } from './SettingsRow';
import { cn } from '../../lib/utils';

interface SettingsScreenProps {
  onBack: () => void;
}

function LanguageSwitch() {
  const language = useSettingsStore((state) => state.language);
  const setLanguage = useSettingsStore((state) => state.setLanguage);

  return (
    <div className="flex overflow-hidden rounded-xl ring-1 ring-slate-200 dark:ring-slate-700">
      {(['en', 'ru'] as Language[]).map((lang) => (
        <button
          key={lang}
          onClick={() => setLanguage(lang)}
          className={cn(
            'px-3 py-1.5 text-xs font-bold uppercase transition-colors',
            language === lang
              ? 'bg-brand-500 text-white'
              : 'bg-white text-slate-500 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700/80',
          )}
        >
          {lang}
        </button>
      ))}
    </div>
  );
}

export function SettingsScreen({ onBack }: SettingsScreenProps) {
  const t = useT();
  const isOnline = useOnlineStatus();
  const [confirmingReset, setConfirmingReset] = useState(false);

  const nickname = useSettingsStore((state) => state.nickname);
  const setNickname = useSettingsStore((state) => state.setNickname);
  const avatarEmoji = useSettingsStore((state) => state.avatarEmoji);
  const setAvatarEmoji = useSettingsStore((state) => state.setAvatarEmoji);
  const theme = useSettingsStore((state) => state.theme);
  const toggleTheme = useSettingsStore((state) => state.toggleTheme);
  const smartHints = useSettingsStore((state) => state.smartHints);
  const toggleSmartHints = useSettingsStore((state) => state.toggleSmartHints);
  const coachMode = useSettingsStore((state) => state.coachMode);
  const toggleCoachMode = useSettingsStore((state) => state.toggleCoachMode);
  const explainMistakes = useSettingsStore((state) => state.explainMistakes);
  const toggleExplainMistakes = useSettingsStore((state) => state.toggleExplainMistakes);
  const antiStressMode = useSettingsStore((state) => state.antiStressMode);
  const toggleAntiStressMode = useSettingsStore((state) => state.toggleAntiStressMode);
  const showTimer = useSettingsStore((state) => state.showTimer);
  const toggleShowTimer = useSettingsStore((state) => state.toggleShowTimer);
  const relaxedMistakes = useSettingsStore((state) => state.relaxedMistakes);
  const toggleRelaxedMistakes = useSettingsStore((state) => state.toggleRelaxedMistakes);
  const soundEffects = useSettingsStore((state) => state.soundEffects);
  const toggleSoundEffects = useSettingsStore((state) => state.toggleSoundEffects);
  const notesAutoClean = useSettingsStore((state) => state.notesAutoClean);
  const toggleNotesAutoClean = useSettingsStore((state) => state.toggleNotesAutoClean);
  const useLevelVisual = useSettingsStore((state) => state.useLevelVisual);
  const toggleUseLevelVisual = useSettingsStore((state) => state.toggleUseLevelVisual);
  const themeSounds = useSettingsStore((state) => state.themeSounds);
  const toggleThemeSounds = useSettingsStore((state) => state.toggleThemeSounds);
  const resetSettings = useSettingsStore((state) => state.resetSettings);

  const resetProgress = useProgressStore((state) => state.resetProgress);
  const resetAchievements = useAchievementsStore((state) => state.resetAchievements);
  const discardSavedGame = useGameStore((state) => state.discardSavedGame);

  const handleResetProgress = () => {
    if (!confirmingReset) {
      setConfirmingReset(true);
      return;
    }
    resetProgress();
    resetAchievements();
    discardSavedGame();
    setConfirmingReset(false);
  };

  return (
    <div className="min-h-screen bg-noise">
      <div className="mx-auto max-w-2xl px-4 pb-16 sm:px-8">
        <header className="flex items-center gap-3 py-6 sm:py-8">
          <button
            onClick={onBack}
            aria-label={t('settings.back')}
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm ring-1 ring-slate-200 transition-all hover:bg-slate-50 active:scale-95 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700 dark:hover:bg-slate-700/80"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-display text-lg font-bold leading-tight text-slate-900 dark:text-white">
            {t('settings.title')}
          </h1>
        </header>

        <SettingsSection title={t('settings.section.profile')}>
          <div className="flex flex-col gap-3 px-5 py-4">
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{t('settings.nickname')}</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                {t('settings.nicknameDesc')}
              </p>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder={t('settings.nicknamePlaceholder')}
                maxLength={20}
                className="mt-2 h-11 w-full rounded-xl bg-slate-100 px-3.5 text-sm text-slate-800 outline-none ring-1 ring-transparent transition-all focus:bg-white focus:ring-brand-400 dark:bg-slate-700/60 dark:text-slate-100 dark:focus:bg-slate-700"
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{t('settings.avatar')}</p>
              <div className="mt-2">
                <AvatarPicker value={avatarEmoji} onChange={setAvatarEmoji} />
              </div>
            </div>
          </div>
        </SettingsSection>

        <SettingsSection title={t('settings.section.appearance')}>
          <SettingsRow
            label={t('settings.darkMode')}
            description={t('settings.darkModeDesc')}
            control={<Switch checked={theme === 'dark'} onChange={toggleTheme} label={t('settings.darkMode')} />}
          />
          <SettingsRow
            label={t('settings.colorTheme')}
            description={t('settings.colorThemeDesc')}
            control={<ThemePicker />}
            stacked
          />
          <SettingsRow
            label={t('settings.levelVisual')}
            description={t('settings.levelVisualDesc')}
            control={<Switch checked={useLevelVisual} onChange={toggleUseLevelVisual} label={t('settings.levelVisual')} />}
          />
          {useLevelVisual && (
            <SettingsRow
              label={t('settings.themeSounds')}
              description={t('settings.themeSoundsDesc')}
              control={<Switch checked={themeSounds} onChange={toggleThemeSounds} label={t('settings.themeSounds')} />}
            />
          )}
          <SettingsRow
            label={t('settings.language')}
            description={t('settings.languageDesc')}
            control={<LanguageSwitch />}
          />
        </SettingsSection>

        <SettingsSection title={t('settings.section.learning')}>
          <SettingsRow
            label={t('settings.smartHints')}
            description={t('settings.smartHintsDesc')}
            control={<Switch checked={smartHints} onChange={toggleSmartHints} label={t('settings.smartHints')} />}
          />
          <SettingsRow
            label={t('settings.coachMode')}
            description={t('settings.coachModeDesc')}
            control={<Switch checked={coachMode} onChange={toggleCoachMode} label={t('settings.coachMode')} />}
          />
          <SettingsRow
            label={t('settings.explainMistakes')}
            description={t('settings.explainMistakesDesc')}
            control={
              <Switch checked={explainMistakes} onChange={toggleExplainMistakes} label={t('settings.explainMistakes')} />
            }
          />
        </SettingsSection>

        <SettingsSection title={t('settings.section.antiStress')}>
          <SettingsRow
            label={t('settings.antiStressMode')}
            description={t('settings.antiStressModeDesc')}
            control={
              <Switch checked={antiStressMode} onChange={toggleAntiStressMode} label={t('settings.antiStressMode')} />
            }
          />
          <SettingsRow
            label={t('settings.showTimer')}
            description={t('settings.showTimerDesc')}
            control={<Switch checked={showTimer} onChange={toggleShowTimer} label={t('settings.showTimer')} />}
          />
          <SettingsRow
            label={t('settings.relaxedMistakes')}
            description={t('settings.relaxedMistakesDesc')}
            control={
              <Switch checked={relaxedMistakes} onChange={toggleRelaxedMistakes} label={t('settings.relaxedMistakes')} />
            }
          />
          <SettingsRow
            label={t('settings.soundEffects')}
            description={t('settings.soundEffectsDesc')}
            control={<Switch checked={soundEffects} onChange={toggleSoundEffects} label={t('settings.soundEffects')} />}
          />
        </SettingsSection>

        <SettingsSection title={t('settings.section.gameplay')}>
          <SettingsRow
            label={t('settings.notesAutoClean')}
            description={t('settings.notesAutoCleanDesc')}
            control={
              <Switch checked={notesAutoClean} onChange={toggleNotesAutoClean} label={t('settings.notesAutoClean')} />
            }
          />
        </SettingsSection>

        <SettingsSection title={t('settings.section.online')}>
          <SettingsRow
            label={t('settings.onlineStatus')}
            description={t('settings.onlineStatusDesc')}
            control={
              <span
                className={cn(
                  'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold',
                  isOnline
                    ? 'bg-accent-50 text-accent-600 dark:bg-accent-500/10 dark:text-accent-400'
                    : 'bg-slate-100 text-slate-500 dark:bg-slate-700/60 dark:text-slate-400',
                )}
              >
                {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
                {isOnline ? t('settings.online') : t('settings.offline')}
              </span>
            }
          />
        </SettingsSection>

        <SettingsSection title={t('settings.section.data')}>
          <SettingsRow
            label={t('settings.resetProgress')}
            description={confirmingReset ? t('settings.resetProgressConfirm') : t('settings.resetProgressDesc')}
            control={
              <button
                onClick={handleResetProgress}
                onBlur={() => setConfirmingReset(false)}
                className={cn(
                  'rounded-xl px-3 py-2 text-xs font-bold transition-colors',
                  confirmingReset
                    ? 'bg-rose-600 text-white hover:bg-rose-700'
                    : 'bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20',
                )}
              >
                {t('settings.resetProgressButton')}
              </button>
            }
          />
          <SettingsRow
            label={t('settings.resetSettingsLabel')}
            control={
              <button
                onClick={resetSettings}
                className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-200 dark:bg-slate-700/60 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                {t('settings.resetSettingsButton')}
              </button>
            }
          />
        </SettingsSection>
      </div>
    </div>
  );
}
