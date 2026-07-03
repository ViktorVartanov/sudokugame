import QRCode from 'qrcode';
import type { ResultPayload } from '../types/online';
import { formatTime } from './utils';

export interface ShareCardOptions {
  result: ResultPayload;
  worldTitle: string;
  difficultyName: string;
  rankLabel: string;
  gradientFrom: string;
  gradientTo: string;
  resultUrl: string;
}

const CARD_WIDTH = 720;
const CARD_HEIGHT = 960;

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawStars(ctx: CanvasRenderingContext2D, centerX: number, y: number, count: number) {
  const starWidth = 56;
  const totalWidth = starWidth * 3;
  const startX = centerX - totalWidth / 2 + starWidth / 2;
  for (let i = 0; i < 3; i++) {
    const x = startX + i * starWidth;
    ctx.font = '44px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = i < count ? '#fbbf24' : 'rgba(255,255,255,0.25)';
    ctx.fillText('★', x, y);
  }
}

/** Renders a premium, self-contained share card (no network calls) as a PNG blob. */
export async function generateShareCard(options: ShareCardOptions): Promise<Blob> {
  const { result, worldTitle, difficultyName, rankLabel, gradientFrom, gradientTo, resultUrl } = options;

  const canvas = document.createElement('canvas');
  canvas.width = CARD_WIDTH;
  canvas.height = CARD_HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  const gradient = ctx.createLinearGradient(0, 0, CARD_WIDTH, CARD_HEIGHT);
  gradient.addColorStop(0, gradientFrom);
  gradient.addColorStop(1, gradientTo);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  // Soft dot texture overlay for depth.
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  for (let x = 20; x < CARD_WIDTH; x += 36) {
    for (let y = 20; y < CARD_HEIGHT; y += 36) {
      ctx.beginPath();
      ctx.arc(x, y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // App brand mark.
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.font = '600 28px sans-serif';
  ctx.fillText('SUDOKU PRIME', CARD_WIDTH / 2, 70);

  // Avatar circle.
  const avatarY = 190;
  ctx.beginPath();
  ctx.arc(CARD_WIDTH / 2, avatarY, 90, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.fill();
  ctx.font = '92px sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillText(result.avatarEmoji, CARD_WIDTH / 2, avatarY + 6);

  // Username.
  ctx.font = '700 46px sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(result.username, CARD_WIDTH / 2, avatarY + 150);

  // World + difficulty.
  ctx.font = '500 28px sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.fillText(`${worldTitle} · ${difficultyName}`, CARD_WIDTH / 2, avatarY + 195);

  drawStars(ctx, CARD_WIDTH / 2, avatarY + 260, result.stars);

  // Rank pill.
  ctx.font = '700 30px sans-serif';
  const rankText = rankLabel;
  const rankWidth = ctx.measureText(rankText).width + 60;
  roundRect(ctx, CARD_WIDTH / 2 - rankWidth / 2, avatarY + 300, rankWidth, 56, 28);
  ctx.fillStyle = 'rgba(255,255,255,0.22)';
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.textBaseline = 'middle';
  ctx.fillText(rankText, CARD_WIDTH / 2, avatarY + 328);
  ctx.textBaseline = 'alphabetic';

  // Stats row.
  const statsY = avatarY + 430;
  const stats: [string, string][] = [
    ['Time', formatTime(result.timeSeconds)],
    ['Mistakes', String(result.mistakes)],
    ['Hints', String(result.hintsUsed)],
  ];
  const colWidth = CARD_WIDTH / 3;
  stats.forEach(([label, value], i) => {
    const x = colWidth * i + colWidth / 2;
    ctx.font = '700 40px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(value, x, statsY);
    ctx.font = '500 22px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillText(label, x, statsY + 34);
  });

  // QR code linking to the result, bottom center.
  try {
    const qrSize = 170;
    const qrX = CARD_WIDTH / 2 - qrSize / 2;
    const qrY = CARD_HEIGHT - qrSize - 70;
    roundRect(ctx, qrX - 16, qrY - 16, qrSize + 32, qrSize + 32, 20);
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.fill();

    const qrDataUrl = await QRCode.toDataURL(resultUrl, { margin: 0, width: qrSize, color: { dark: '#1a1a2e', light: '#ffffff' } });
    const qrImage = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = qrDataUrl;
    });
    ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);
  } catch {
    // QR generation is a nice-to-have; skip silently if it fails (e.g. very old browser).
  }

  ctx.font = '500 20px sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.textAlign = 'center';
  ctx.fillText('Scan to try this puzzle', CARD_WIDTH / 2, CARD_HEIGHT - 30);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('toBlob failed'))), 'image/png');
  });
}
