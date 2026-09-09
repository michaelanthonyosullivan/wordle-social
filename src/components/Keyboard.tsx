import React from "react";

const KEY_ROWS = [
  ["Q","W","E","R","T","Y","U","I","O","P"],
  ["A","S","D","F","G","H","J","K","L"],
  ["ENTER","Z","X","C","V","B","N","M","⌫"]
];

type Feedback = "correct" | "present" | "absent";

function getLetterColors(guesses: string[], solution: string) {
  const feedbackMap: Record<string, Feedback> = {};
  guesses.forEach(g => {
    const fb = Array(solution.length).fill("absent");
    const used = Array(solution.length).fill(false);
    // correct
    for (let i = 0; i < solution.length; ++i) {
      if (g[i] === solution[i]) {
        fb[i] = "correct";
        used[i] = true;
      }
    }
    for (let i = 0; i < solution.length; ++i) {
      if (fb[i] === "correct") continue;
      for (let j = 0; j < solution.length; ++j) {
        if (!used[j] && g[i] === solution[j]) {
          fb[i] = "present";
          used[j] = true;
          break;
        }
      }
    }
    for (let i = 0; i < g.length; ++i) {
      const l = g[i];
      // Always use best color: correct > present > absent
      if (
        feedbackMap[l] !== "correct" &&
        (
          fb[i] === "correct" ||
          (fb[i] === "present" && feedbackMap[l] !== "present")
        )
      ) {
        feedbackMap[l] = fb[i];
      } else if (!feedbackMap[l]) {
        feedbackMap[l] = fb[i];
      }
    }
  });
  return feedbackMap;
}

export const Keyboard: React.FC<{
  guesses: string[];
  solution: string;
  onChar: (c: string) => void;
  onBackspace: () => void;
  onEnter: () => void;
  disabled?: boolean;
}> = ({guesses, solution, onChar, onBackspace, onEnter, disabled}) => {
  const letterColors = getLetterColors(guesses, solution);

  const handleClick = (key: string) => {
    if (disabled) return;
    if (key === "ENTER") onEnter();
    else if (key === "⌫") onBackspace();
    else onChar(key);
  };

  const keyStyle = (key: string) => {
    if (key === "ENTER" || key === "⌫") {
      return "px-1 sm:px-4 py-2.5 sm:py-2 rounded bg-green-700 text-lime-200 font-black border-2 border-green-400 shadow-lg hover:scale-105 hover:bg-green-600 transition text-xs sm:text-sm flex items-center justify-center min-w-0";
    }
    let bg =
      "bg-[#0f1a14] border-2 border-green-800 text-green-100 shadow-inner";
    if (letterColors[key] === "correct")
      bg =
        "bg-gradient-to-b from-green-400 to-emerald-600 text-white border-2 border-lime-300 shadow-md shadow-green-500/40";
    else if (letterColors[key] === "present")
      bg =
        "bg-gradient-to-b from-amber-300 to-amber-600 text-black border-2 border-amber-200 shadow shadow-amber-500/40";
    else if (letterColors[key] === "absent")
      bg =
        "bg-[#3a3f3c] text-slate-400 border-2 border-[#2a2f2c] shadow-inner";
    return `px-0.5 sm:px-2 py-2.5 sm:py-3 my-0.5 sm:my-1 rounded-xl uppercase font-bold transition-transform text-base sm:text-xl ${bg} hover:brightness-110 focus:outline-none min-w-0 flex-1 flex items-center justify-center`;
  };

  return (
    <div className="user-select-none w-full flex flex-col items-center mx-auto px-0">
      {KEY_ROWS.map((row, rIdx) => (
        <div key={rIdx} className="flex justify-center mb-0.5 sm:mb-1 w-full gap-px sm:gap-2">
          {row.map((key) => (
            <button
              key={key}
              disabled={disabled}
              className={keyStyle(key) + " " + (disabled ? "opacity-60" : "")}
              onClick={() => handleClick(key)}
              tabIndex={-1}
              type="button"
            >
              {key}
            </button>
          ))}
        </div>
      ))}
    </div>
  )
}
