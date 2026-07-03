/**
 * Self-contained deep-link payloads. There is no backend: the full payload
 * is base64url-encoded directly into the share link itself (see
 * lib/deepLinks.ts), so opening the link on any device is enough to
 * reconstruct it — no account, no server lookup.
 */
export interface BattleInvitePayload {
  seed: number;
  levelId: number;
  creatorUsername: string;
  creatorAvatarEmoji: string;
  createdAt: number;
  /** Present when the invite was generated from a finished game ("Challenge Friend"), enabling an automatic time comparison once the receiver finishes. */
  creatorResult?: { timeSeconds: number; mistakes: number };
}

export interface ResultPayload {
  username: string;
  avatarEmoji: string;
  levelId: number;
  timeSeconds: number;
  mistakes: number;
  hintsUsed: number;
  stars: number;
  seed: number;
  completedAt: number;
}
