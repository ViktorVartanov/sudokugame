import type { StoryWorld } from '../../lib/storyWorlds';

interface WorldDecorationsProps {
  world: StoryWorld;
}

/** Two faint, slowly-floating emoji anchored to opposite corners — decorative only, never overlapping the board. */
export function WorldDecorations({ world }: WorldDecorationsProps) {
  const [first, second] = world.decorations;
  return (
    // absolute (not fixed): this sits inside App.tsx's `animate-view-in`
    // wrapper, which briefly has a CSS `transform` during transitions — a
    // `fixed` descendant of a `transform`ed ancestor anchors to that
    // ancestor instead of the viewport, not just mid-transition but for its
    // whole lifetime. `absolute` + the parent's `relative` sidesteps this
    // entirely by being explicit about which box it covers.
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <span
        className="absolute left-3 top-[12%] text-4xl opacity-[0.16] animate-float sm:text-5xl"
        style={{ animationDuration: '5.5s' }}
      >
        {first}
      </span>
      <span
        className="absolute right-3 bottom-[14%] text-4xl opacity-[0.16] animate-float sm:text-5xl"
        style={{ animationDuration: '6.5s', animationDelay: '1.2s' }}
      >
        {second}
      </span>
    </div>
  );
}
