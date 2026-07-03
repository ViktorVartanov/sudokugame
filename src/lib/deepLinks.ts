import type { BattleInvitePayload, ResultPayload } from '../types/online';

/**
 * Self-contained, backend-free share links. Since there's no server to store
 * invites or results, the full payload is base64url-encoded directly into
 * the link. Opening the link on any device (with the app installed/loaded)
 * is enough to reconstruct the invite or result — no lookup required. A
 * future backend could swap these for short server-generated ids without
 * changing how the rest of the app consumes them.
 */

function utf8ToBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlToUtf8(encoded: string): string {
  const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

function encodePayload<T>(payload: T): string {
  return utf8ToBase64Url(JSON.stringify(payload));
}

function decodePayload<T>(code: string): T | null {
  try {
    return JSON.parse(base64UrlToUtf8(code)) as T;
  } catch {
    return null;
  }
}

function getOrigin(): string {
  return typeof window !== 'undefined' ? window.location.origin : '';
}

export function buildBattleInviteUrl(payload: BattleInvitePayload): string {
  return `${getOrigin()}/invite/battle?code=${encodePayload(payload)}`;
}

export function buildResultUrl(payload: ResultPayload): string {
  return `${getOrigin()}/result/${encodePayload(payload)}`;
}

export type ParsedRoute =
  | { type: 'battle-invite'; payload: BattleInvitePayload }
  | { type: 'result'; payload: ResultPayload }
  | { type: null };

/** Reads the current URL once (call at app startup) to detect a shared deep link. */
export function parseCurrentRoute(): ParsedRoute {
  if (typeof window === 'undefined') return { type: null };
  const { pathname, search } = window.location;
  const params = new URLSearchParams(search);

  if (pathname === '/invite/battle') {
    const code = params.get('code');
    const payload = code && decodePayload<BattleInvitePayload>(code);
    if (payload) return { type: 'battle-invite', payload };
  }

  const resultMatch = pathname.match(/^\/result\/([\w-]+)$/);
  if (resultMatch) {
    const payload = decodePayload<ResultPayload>(resultMatch[1]);
    if (payload) return { type: 'result', payload };
  }

  return { type: null };
}

/** Clears the deep-link path back to `/` once handled, so a refresh doesn't re-trigger it and normal in-app navigation can take over. */
export function clearRouteFromUrl(): void {
  if (typeof window === 'undefined') return;
  window.history.replaceState({}, '', '/');
}
