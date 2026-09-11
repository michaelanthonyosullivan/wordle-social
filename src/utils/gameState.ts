import { dateKey } from "./daily";
import type { ShareResult } from "./share";

// In-progress round persistence. The board, current guess and status are saved
// to localStorage on every change so shutting the app mid-round and reopening it
// resumes exactly where you left off. A stale Daily round (from a previous
// calendar day) is discarded so the new day always starts fresh.

export type Mode = "daily" | "practice";
export type Status = "playing" | "won" | "lost";

export interface SavedRound {
  mode: Mode;
  solution: string;
  guesses: string[];
  currentGuess: string;
  status: Status;
  /** ISO-ish date key when mode === 'daily'. */
  dayKey?: string;
}

const STORAGE_KEY = "wordleSocialRound";
const WORD_LENGTH = 5;

function isFiveLetters(value: unknown): value is string {
  return typeof value === "string" && /^[a-z]{5}$/i.test(value);
}

/**
 * Restore the last saved round, or null when there is nothing usable to resume.
 * Daily rounds only resume on the same calendar day they were started.
 */
export function loadRound(today: string = dateKey()): SavedRound | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SavedRound>;

    const mode: Mode = parsed.mode === "practice" ? "practice" : "daily";
    if (!isFiveLetters(parsed.solution)) return null;
    // A new day means a new shared word: don't resurrect yesterday's Daily.
    if (mode === "daily" && parsed.dayKey !== today) return null;

    const guesses = Array.isArray(parsed.guesses)
      ? parsed.guesses.filter(isFiveLetters).map((g) => g.toUpperCase())
      : [];
    const status: Status =
      parsed.status === "won" || parsed.status === "lost" ? parsed.status : "playing";
    const currentGuess =
      status === "playing" && typeof parsed.currentGuess === "string"
        ? parsed.currentGuess.toUpperCase().replace(/[^A-Z]/g, "").slice(0, WORD_LENGTH)
        : "";

    return {
      mode,
      solution: parsed.solution.toUpperCase(),
      guesses,
      currentGuess,
      status,
      dayKey: mode === "daily" ? today : undefined,
    };
  } catch (error) {
    console.warn("Failed to load saved round from localStorage:", error);
    return null;
  }
}

export function saveRound(round: SavedRound) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(round));
  } catch (error) {
    console.warn("Failed to save round to localStorage:", error);
  }
}

export function clearRound() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn("Failed to clear saved round from localStorage:", error);
  }
}

/** Rebuild the shareable result for a restored, already-finished round. */
export function resultFromRound(round: SavedRound): ShareResult | null {
  if (round.status === "playing") return null;
  return {
    mode: round.mode,
    guesses: round.guesses,
    solution: round.solution,
    won: round.status === "won",
    dayKey: round.mode === "daily" ? round.dayKey : undefined,
  };
}
