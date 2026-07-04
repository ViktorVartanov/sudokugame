import { useState } from 'react';
import { Compass, Lightbulb, Flame, type LucideIcon } from 'lucide-react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useT } from '../../lib/i18n';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { cn } from '../../lib/utils';

interface Slide {
  icon: LucideIcon;
  titleKey: string;
  descriptionKey: string;
}

const SLIDES: Slide[] = [
  { icon: Compass, titleKey: 'onboarding.slide1.title', descriptionKey: 'onboarding.slide1.description' },
  { icon: Lightbulb, titleKey: 'onboarding.slide2.title', descriptionKey: 'onboarding.slide2.description' },
  { icon: Flame, titleKey: 'onboarding.slide3.title', descriptionKey: 'onboarding.slide3.description' },
];

/**
 * First-launch welcome carousel — a brand-new player otherwise lands
 * straight on the level list with no hint that this isn't just another
 * generic Sudoku app. Shown once (gated by `hasSeenOnboarding`), skippable
 * at any point, and never re-triggered by a settings reset (see
 * useSettingsStore.resetSettings, which preserves this flag).
 */
export function OnboardingModal() {
  const hasSeenOnboarding = useSettingsStore((state) => state.hasSeenOnboarding);
  const completeOnboarding = useSettingsStore((state) => state.completeOnboarding);
  const [step, setStep] = useState(0);
  const t = useT();

  const isLast = step === SLIDES.length - 1;
  const slide = SLIDES[step];
  const Icon = slide.icon;

  return (
    <Modal open={!hasSeenOnboarding} onClose={completeOnboarding}>
      <div className="flex flex-col items-center text-center">
        <button
          onClick={completeOnboarding}
          className="self-end text-xs font-semibold text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-200"
        >
          {t('onboarding.skip')}
        </button>

        <div className="mt-2 flex h-16 w-16 items-center justify-center rounded-full border-2 border-brand-300 text-brand-600 dark:border-brand-500/40 dark:text-brand-400">
          <Icon size={30} />
        </div>

        <h2 className="mt-5 font-serif text-2xl font-bold text-slate-900 dark:text-white">{t(slide.titleKey)}</h2>
        <p className="mt-2.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{t(slide.descriptionKey)}</p>

        <div className="mt-6 flex items-center gap-1.5">
          {SLIDES.map((_, i) => (
            <span
              key={i}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300',
                i === step ? 'w-5 bg-brand-500' : 'w-1.5 bg-slate-200 dark:bg-slate-700',
              )}
            />
          ))}
        </div>

        <Button
          variant="primary"
          size="lg"
          onClick={() => (isLast ? completeOnboarding() : setStep((s) => s + 1))}
          className="mt-6 w-full"
        >
          {isLast ? t('onboarding.start') : t('onboarding.next')}
        </Button>
      </div>
    </Modal>
  );
}
