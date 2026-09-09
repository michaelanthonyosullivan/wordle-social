import { dailyPuzzleNumber } from "./daily";
import { MAX_GUESSES } from "./stats";

// Builds the spoiler-safe emoji result block copied to the clipboard so
// friends can paste it into group chat and compare (and trash-talk).

type Feedback = "correct" | "present" | "absent";

const EMOJI: Record<Feedback, string> = {
  correct: "🟩",
  present: "🟨",
  absent: "⬛",
};

function getFeedback(guess: string, solution: string): Feedback[] {
  if (guess.length !== solution.length) {
    return Array(solution.length).fill("absent") as Feedback[];
  }
  const res: Feedback[] = Array(solution.length).fill("absent");
  const used = Array(solution.length).fill(false);
  for (let i = 0; i < solution.length; i++) {
    if (guess[i] === solution[i]) {
      res[i] = "correct";
      used[i] = true;
    }
  }
  for (let i = 0; i < solution.length; i++) {
    if (res[i] === "correct") continue;
    for (let j = 0; j < solution.length; j++) {
      if (!used[j] && guess[i] === solution[j]) {
        res[i] = "present";
        used[j] = true;
        break;
      }
    }
  }
  return res;
}

export interface ShareResult {
  mode: "daily" | "practice";
  guesses: string[]; // every submitted guess, in order
  solution: string;
  won: boolean;
  /** ISO-ish date key when mode === 'daily'. */
  dayKey?: string;
}

/** Wordle-style score label, e.g. "3/6" or "X/6". */
function scoreLabel(r: ShareResult): string {
  const denom = MAX_GUESSES;
  return r.won ? `${r.guesses.length}/${denom}` : `X/${denom}`;
}

function header(r: ShareResult): string {
  const base = "Wordle Social";
  if (r.mode === "daily") {
    const num = r.dayKey ? dailyPuzzleNumber(r.dayKey) : "";
    return `${base} — Daily${num ? ` #${num}` : ""} ${scoreLabel(r)}`;
  }
  return `${base} — Practice ${scoreLabel(r)}`;
}

export function buildShareText(r: ShareResult): string {
  const lines: string[] = [header(r)];
  for (const guess of r.guesses) {
    lines.push(
      getFeedback(guess, r.solution)
        .map((f) => EMOJI[f])
        .join("")
    );
  }
  return lines.join("\n");
}

export async function copyShareText(r: ShareResult): Promise<boolean> {
  const text = buildShareText(r);
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.warn("Clipboard write failed:", error);
    return false;
  }
}
