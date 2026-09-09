import { dateKey } from "./daily";

// Daily-mode progress is persisted in localStorage so your streaks and guess
// distribution survive refreshes. Only Daily games feed these stats; free-play
// (Practice) rounds never touch them.

export const MAX_GUESSES = 6;

export type ResultKind = "won" | "lost";

export interface DailyStats {
  plays: number;
  wins: number;
  /** Consecutive daily wins ending on `lastWonKey`. */
  currentStreak: number;
  maxStreak: number;
  /** distribution[0] = times unsolved after 6; distribution[n] = solved in n (1..6). */
  distribution: number[];
  /** Date key (YYYY-MM-DD) of the last Day, regardless of result. */
  lastDayKey: string | null;
  lastWon: boolean;
}

const STORAGE_KEY = "wordleSocialStats";

const EMPTY: DailyStats = {
  plays: 0,
  wins: 0,
  currentStreak: 0,
  maxStreak: 0,
  distribution: [0, 0, 0, 0, 0, 0, 0],
  lastDayKey: null,
  lastWon: false,
};

export function emptyStats(): DailyStats {
  return { ...EMPTY, distribution: [...EMPTY.distribution] };
}

export function loadStats(): DailyStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyStats();
    const parsed = JSON.parse(raw) as Partial<DailyStats>;
    const base = emptyStats();
    return {
      ...base,
      ...parsed,
      distribution: Array.isArray(parsed.distribution)
        ? [...Array(MAX_GUESSES + 1)].map((_, i) => parsed.distribution?.[i] ?? 0)
        : base.distribution,
    };
  } catch (error) {
    console.warn("Failed to load stats from localStorage:", error);
    return emptyStats();
  }
}

function saveStats(stats: DailyStats) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch (error) {
    console.warn("Failed to save stats to localStorage:", error);
  }
}

/**
 * Record the outcome of a Daily game.
 *
 * Streak rule: a win only extends the streak when the previous finished Daily
 * was also a win on the *consecutive* calendar day. Losing resets the current
 * streak to zero; missing / finishing on a non-consecutive day also breaks it.
 */
export function recordDailyResult(
  won: boolean,
  guessesUsed: number,
  today: string = dateKey()
): DailyStats {
  const stats = loadStats();
  // Daily results lock once per calendar day: a rewind/replay that finishes a
  // second time today never double-counts. The first result of the day stands.
  if (stats.lastDayKey === today) return stats;
  stats.plays += 1;
  if (won) {
    stats.wins += 1;
    const consecutiveWin =
      stats.lastWon && stats.lastDayKey === yesterdayKey(today);
    stats.currentStreak = consecutiveWin ? stats.currentStreak + 1 : 1;
    stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
    const bucket = Math.min(guessesUsed, MAX_GUESSES);
    stats.distribution[bucket] += 1;
  } else {
    stats.currentStreak = 0;
    stats.distribution[0] += 1;
  }
  stats.lastDayKey = today;
  stats.lastWon = won;
  saveStats(stats);
  return stats;
}

function yesterdayKey(today: string): string {
  const d = new Date(today + "T00:00:00");
  d.setDate(d.getDate() - 1);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}
