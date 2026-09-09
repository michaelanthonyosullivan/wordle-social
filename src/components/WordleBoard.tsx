
import React from "react";

// Feedback per letter: 'correct' (right spot), 'present' (wrong spot), 'absent' (not in word)
type Feedback = "correct" | "present" | "absent";

function getFeedback(guess: string, solution: string): Feedback[] {
  const res: Feedback[] = Array(solution.length).fill("absent");
  const used = Array(solution.length).fill(false);
  // First pass: correct letter & spot
  for (let i = 0; i < solution.length; ++i) {
    if (guess[i] === solution[i]) {
      res[i] = "correct";
      used[i] = true;
    }
  }
  // Second pass: present but misplaced
  for (let i = 0; i < solution.length; ++i) {
    if (res[i] === "correct") continue;
    for (let j = 0; j < solution.length; ++j) {
      if (!used[j] && guess[i] === solution[j]) {
        res[i] = "present";
        used[j] = true;
        break;
      }
    }
  }
  return res;
}

export const WordleBoard: React.FC<{
  guesses: string[];
  currentGuess: string;
  solution: string;
  maxGuesses?: number;
}> = ({ guesses, currentGuess, solution, maxGuesses = 6 }) => {
  const ROWS = maxGuesses;
  const COLS = solution.length;
  const rows: { guess: string; feedback?: Feedback[] }[] = [];

  for (let i = 0; i < ROWS; ++i) {
    if (i < guesses.length) {
      rows.push({ guess: guesses[i], feedback: getFeedback(guesses[i], solution) });
    } else if (i === guesses.length) {
      rows.push({ guess: currentGuess });
    } else {
      rows.push({ guess: "" });
    }
  }

  return (
    <div className="grid grid-rows-6 gap-1.5 sm:gap-2 w-full max-w-[340px] mx-auto select-none">
      {rows.map((row, rIdx) => (
        <div key={rIdx} className="grid grid-cols-5 gap-1.5 sm:gap-2">
          {Array.from({ length: COLS }).map((_, cIdx) => {
            const char = row.guess[cIdx] || "";
            let feedback: Feedback | undefined = undefined;
            if (row.feedback) feedback = row.feedback[cIdx];
            // Animate input cells
            const extra = !row.feedback && char ? "border-4 border-lime-400 bg-green-900 bg-opacity-90 shadow-xl animate-scale-in" : "";
            // Colorful tile feedback
            let bg =
              "bg-[#121f18] border-2 border-green-700/50 text-green-100 shadow-inner";
            if (feedback === "correct") bg = "bg-gradient-to-br from-green-400 via-green-500 to-emerald-700 text-white border-2 border-lime-300 shadow-lg shadow-green-500/40 animate-scale-in";
            else if (feedback === "present") bg = "bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-600 text-black border-2 border-amber-200 shadow-lg shadow-amber-500/40 animate-scale-in";
            else if (feedback === "absent") bg = "bg-gradient-to-br from-slate-500 via-slate-600 to-slate-700 text-slate-300 border-2 border-slate-800 shadow animate-fade-in";
            return (
              <div
                key={cIdx}
                className={`flex items-center justify-center aspect-square text-xl sm:text-2xl font-extrabold rounded-lg sm:rounded-xl uppercase transition-all duration-300 min-w-0 ${bg} ${extra}`}
                style={{
                  width: "100%",
                  textShadow: feedback ? "0px 2px 8px rgba(30,30,30,0.07)" : "",
                  filter: feedback === "correct" ? "drop-shadow(0 0 8px #6ee7b7)" : feedback === "present" ? "drop-shadow(0 0 8px #fdba74)" : "",
                }}
              >
                {char}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};
