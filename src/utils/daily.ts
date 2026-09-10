import { ANSWER_WORDS } from "./wordData";

// All helpers here derive the "shared daily word" purely from the calendar date,
// using only the static, curated answer list — never player-added words — so that
// every friend who plays gets the exact same word on the same day.

/** Local YYYY-MM-DD key for a given date (defaults to today). */
export function dateKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Whole days between a date key and the local Unix epoch (1970-01-01). */
function dayNumber(key: string): number {
  const [y, m, d] = key.split("-").map(Number);
  return Math.floor(Date.UTC(y, m - 1, d) / 86_400_000);
}

/** Stable, human-readable puzzle number = days since 2024-01-01. */
export function dailyPuzzleNumber(key: string): number {
  return dayNumber(key) - dayNumber("2024-01-01");
}

/**
 * The word every player shares today. Deterministic per calendar date, so
 * scores are comparable within the friend group on the same day.
 */
export function getDailyWord(d: Date = new Date()): string {
  const words = ANSWER_WORDS;
  const dn = dayNumber(dateKey(d));
  const idx = ((dn % words.length) + words.length) % words.length;
  return words[idx];
}
