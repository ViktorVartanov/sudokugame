import confetti from 'canvas-confetti';

/** Fires a celebratory two-burst confetti sequence from both sides of the screen. */
export function celebrateWin() {
  const duration = 1400;
  const end = Date.now() + duration;
  const colors = ['#7057ff', '#16c98a', '#f5c04d', '#ff6f91'];

  (function frame() {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 65,
      origin: { x: 0, y: 0.7 },
      colors,
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 65,
      origin: { x: 1, y: 0.7 },
      colors,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();

  confetti({
    particleCount: 90,
    spread: 100,
    origin: { y: 0.6 },
    colors,
    startVelocity: 45,
    scalar: 1.1,
  });
}

/** A longer, gold-heavy fireworks sequence for the grand finale (completing Grandmaster). */
export function celebrateGrandmaster() {
  const duration = 3200;
  const end = Date.now() + duration;
  const colors = ['#f5c04d', '#ffe08a', '#7057ff', '#ffffff'];

  const fire = () => {
    confetti({
      particleCount: 60,
      spread: 360,
      startVelocity: 35,
      origin: { x: Math.random() * 0.6 + 0.2, y: Math.random() * 0.3 + 0.15 },
      colors,
      scalar: 1.2,
      ticks: 200,
    });
  };

  fire();
  const burstInterval = setInterval(() => {
    if (Date.now() > end) {
      clearInterval(burstInterval);
      return;
    }
    fire();
  }, 450);

  (function sideStreams() {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.8 },
      colors,
      startVelocity: 55,
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.8 },
      colors,
      startVelocity: 55,
    });
    if (Date.now() < end) requestAnimationFrame(sideStreams);
  })();
}
