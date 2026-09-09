import React, { useState, useCallback } from "react";
import { WordleBoard } from "@/components/WordleBoard";
import { Keyboard } from "@/components/Keyboard";
import { InstructionsDialog } from "@/components/InstructionsDialog";
import { WordValidationDialog } from "@/components/WordValidationDialog";
import { StatsDialog } from "@/components/StatsDialog";
import { getRandomWord, validWords, addWordToList } from "@/utils/wordlist";
import { dateKey, getDailyWord, dailyPuzzleNumber } from "@/utils/daily";
import { loadStats, recordDailyResult, type DailyStats } from "@/utils/stats";
import { MAX_GUESSES } from "@/utils/stats";
import { copyShareText, type ShareResult } from "@/utils/share";
import { toast } from "@/hooks/use-toast";

const WORD_LENGTH = 5;

type Mode = "daily" | "practice";
type Status = "playing" | "won" | "lost";

const dayKey = dateKey();

const Index = () => {
  const [mode, setMode] = useState<Mode>("daily");
  const [solution, setSolution] = useState(() => getDailyWord());
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [status, setStatus] = useState<Status>("playing");
  const [showInstructions, setShowInstructions] = useState(false);
  const [showWordValidation, setShowWordValidation] = useState(false);
  const [pendingWord, setPendingWord] = useState("");
  const [showStats, setShowStats] = useState(false);
  const [stats, setStats] = useState<DailyStats>(() => loadStats());
  // The most recent finished round, used to build the emoji share block.
  const [result, setResult] = useState<ShareResult | null>(null);

  // Finish the current round: mark status, persist daily stats once, stash a
  // shareable result. `finalGuesses` already includes the final guess.
  const completeRound = (finalGuesses: string[], won: boolean) => {
    const count = finalGuesses.length;
    setStatus(won ? "won" : "lost");
    setResult({
      mode,
      guesses: finalGuesses,
      solution,
      won,
      dayKey: mode === "daily" ? dayKey : undefined,
    });
    if (mode === "daily") {
      setStats(recordDailyResult(won, count, dayKey));
    }
    if (won) {
      toast({
        title: "🎉 Congratulations!",
        description:
          mode === "daily"
            ? `You solved today's word in ${count} ${count === 1 ? "guess" : "guesses"}!`
            : "You guessed the word!",
        className:
          "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-green-600 border-2 border-lime-300 shadow-2xl font-black text-white text-lg text-center max-w-md z-50",
      });
    } else {
      toast({
        title: "💀 Game Over",
        description: `The word was "${solution}"`,
        variant: "destructive",
        className:
          "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black border-2 border-red-500 shadow-2xl font-black text-red-400 text-lg text-center max-w-md z-50",
      });
    }
  };

  const commitGuess = (rawGuess: string) => {
    const guess = rawGuess.toUpperCase();
    if (guess.length !== WORD_LENGTH) return;
    const next = [...guesses, guess];
    setGuesses(next);
    setCurrentGuess("");

    if (guess === solution) {
      completeRound(next, true);
    } else if (next.length >= MAX_GUESSES) {
      completeRound(next, false);
    }
  };

  const handleChar = useCallback(
    (char: string) => {
      if (status !== "playing") return;
      if (currentGuess.length < WORD_LENGTH) {
        setCurrentGuess((g) => (g + char).toUpperCase());
      }
    },
    [currentGuess, status]
  );

  const handleBackspace = useCallback(() => {
    if (status !== "playing") return;
    setCurrentGuess((g) => g.slice(0, -1));
  }, [status]);

  const submitGuess = useCallback(() => {
    if (status !== "playing" || currentGuess.length !== WORD_LENGTH) return;
    if (showWordValidation) return;

    const guess = currentGuess.toUpperCase();

    if (!validWords.has(guess)) {
      setPendingWord(guess);
      setShowWordValidation(true);
      return;
    }
    commitGuess(guess);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, currentGuess, showWordValidation, solution, guesses]);

  const handleWordValidationResponse = (addWord: boolean) => {
    if (addWord) {
      addWordToList(pendingWord);
      toast({
        title: "Word Added",
        description: `"${pendingWord}" has been added to the word list.`,
      });
      commitGuess(pendingWord);
    } else {
      setCurrentGuess("");
    }
    setShowWordValidation(false);
    setPendingWord("");
  };

  // Physical keyboard events
  React.useEffect(() => {
    if (status !== "playing") return;

    const listener = (e: KeyboardEvent) => {
      if (showWordValidation) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === "Backspace") {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === "Enter") {
        e.preventDefault();
        submitGuess();
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        e.preventDefault();
        handleChar(e.key.toUpperCase());
      }
    };

    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [handleChar, handleBackspace, submitGuess, status, showWordValidation]);

  // Roll back the most recent guess, resuming mid-game.
  const rewind = () => {
    if (status !== "playing" || guesses.length === 0) return;
    setGuesses((g) => g.slice(0, -1));
    setCurrentGuess("");
  };

  // Restart the board for the current mode's word.
  const restart = () => {
    setGuesses([]);
    setCurrentGuess("");
    setStatus("playing");
  };

  // Begin a brand-new round: daily picks today's shared word; practice picks a
  // fresh random word. Used when switching modes and after finishing.
  const beginNewRound = (target: Mode) => {
    setMode(target);
    setSolution(target === "daily" ? getDailyWord() : getRandomWord());
    setGuesses([]);
    setCurrentGuess("");
    setStatus("playing");
    setResult(null);
  };

  const switchMode = (target: Mode) => {
    if (target === mode) return;
    beginNewRound(target);
  };

  const handleShare = async () => {
    if (!result) return;
    const ok = await copyShareText(result);
    if (ok) {
      toast({
        title: "Copied to clipboard 📋",
        description: "Paste it into the group chat to compare!",
      });
    } else {
      toast({
        title: "Copy failed",
        description: "Could not copy. Your clipboard may be blocked.",
        variant: "destructive",
      });
    }
  };

  // The current round is finished (win/loss locked).
  const finished = status !== "playing";

  const modePill = (target: Mode, label: string) => (
    <button
      onClick={() => switchMode(target)}
      className={`text-sm font-black rounded-full px-4 py-1.5 border-2 transition ${
        mode === target
          ? "bg-green-500 text-black border-lime-200 shadow-lg"
          : "bg-black/40 text-green-300 border-green-500 hover:bg-green-900/60"
      }`}
    >
      {label}
    </button>
  );

  const heading =
    mode === "daily" ? (
      <>
        Daily Wordle
        <span className="text-sm font-bold text-green-200/80 block sm:inline sm:ml-2">
          #{dailyPuzzleNumber(dayKey)} — everyone plays the same word
        </span>
      </>
    ) : (
      <>Free Practice
        <span className="text-sm font-bold text-green-200/80 block sm:inline sm:ml-2">
          unlimited rounds, nothing counts
        </span>
      </>
    );

  return (
    <div className="flex w-full flex-col items-center justify-center flex-1 py-4 sm:py-10">
      <header className="w-full max-w-xl mb-8">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          <div className="text-center">
            <h1
              className="text-5xl font-black tracking-[0.12em] text-transparent bg-clip-text bg-gradient-to-br from-lime-300 via-green-400 to-emerald-500"
              style={{ filter: "drop-shadow(0 0 18px rgba(34,197,94,0.55))" }}
            >
              WORDLE
            </h1>
            <p className="text-green-300/90 font-semibold text-sm italic">by Michael O'Sullivan</p>
          </div>
        </div>

        <div className="mt-3 text-center">
          <p className="text-green-100 font-black text-lg sm:text-xl tracking-wide">{heading}</p>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          {modePill("daily", "Daily")}
          {modePill("practice", "Free Practice")}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => setShowInstructions(true)}
            className="text-green-300 bg-black/40 font-bold text-sm rounded-full border-2 border-green-500 hover:bg-green-500 hover:text-black px-5 py-2 shadow-md transition"
          >
            Help?
          </button>
          {!finished && (
            <>
              <button
                onClick={restart}
                className="text-green-300 bg-black/40 font-bold text-sm rounded-full border-2 border-green-500 hover:bg-green-500 hover:text-black px-5 py-2 shadow-md transition"
                aria-label="Restart"
              >
                Restart?
              </button>
              <button
                onClick={rewind}
                disabled={guesses.length === 0}
                className="text-amber-300 bg-black/40 font-bold text-sm rounded-full border-2 border-amber-500 hover:bg-amber-500 hover:text-black px-5 py-2 shadow-md transition disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-black/40 disabled:hover:text-amber-300 disabled:hover:border-amber-500"
                aria-label="Rewind one guess"
                title="Remove the most recent guess (roll back one row)"
              >
                ↺ Rewind
              </button>
            </>
          )}
          <button
            onClick={() => {
              setStats(loadStats());
              setShowStats(true);
            }}
            className="text-lime-300 bg-black/40 font-bold text-sm rounded-full border-2 border-lime-400 hover:bg-lime-400 hover:text-black px-5 py-2 shadow-md transition"
            aria-label="View statistics"
          >
            📊 Stats
          </button>
        </div>
      </header>

      <main className="w-full max-w-4xl sm:max-w-2xl flex flex-col items-center border-2 border-green-600 rounded-xl px-1.5 sm:px-16 py-3 sm:py-8 bg-black/30">
        <div className="w-full wordle-card rounded-xl p-1.5 sm:p-4">
          <WordleBoard
            guesses={guesses}
            currentGuess={status === "playing" ? currentGuess : ""}
            solution={solution}
            maxGuesses={MAX_GUESSES}
          />
        </div>
        <div className="mt-4 sm:mt-8 w-full max-w-lg wordle-keyboard-card rounded-xl p-1.5 sm:p-4">
          <Keyboard
            guesses={guesses}
            solution={solution}
            onChar={handleChar}
            onBackspace={handleBackspace}
            onEnter={submitGuess}
            disabled={status !== "playing"}
          />
        </div>

        {finished && (
          <div className="mt-6 w-full max-w-lg text-center animate-fade-in space-y-3">
            {mode === "daily" && status === "won" && (
              <p className="text-green-300 font-bold text-sm animate-scale-in">
                Today's word solved — challenge your friends below.
              </p>
            )}
            {mode === "daily" && status === "lost" && (
              <p className="text-green-300 font-bold text-sm">
                Better luck tomorrow — that one word caps today's run.
              </p>
            )}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={handleShare}
                disabled={!result}
                className="px-5 py-2.5 bg-lime-300 text-black rounded-lg font-black text-sm uppercase tracking-wide shadow-lg border-2 border-green-700 hover:scale-105 hover:bg-lime-200 transition disabled:opacity-50"
              >
                📣 Share
              </button>
              <button
                onClick={() => {
                  setStats(loadStats());
                  setShowStats(true);
                }}
                className="px-5 py-2.5 bg-black/50 text-lime-300 rounded-lg font-black text-sm uppercase tracking-wide border-2 border-lime-400 hover:scale-105 hover:bg-green-900/70 transition"
              >
                📊 Stats
              </button>
              {mode === "daily" ? (
                <button
                  onClick={() => beginNewRound("practice")}
                  className="px-5 py-2.5 bg-green-600 text-white rounded-lg font-black text-sm uppercase tracking-wide shadow-green-900/60 shadow-2xl border-2 border-lime-300 hover:scale-105 hover:bg-green-500 transition"
                >
                  Practice another word →
                </button>
              ) : (
                <button
                  onClick={() => beginNewRound("practice")}
                  className="px-5 py-2.5 bg-green-600 text-white rounded-lg font-black text-sm uppercase tracking-wide shadow-green-900/60 shadow-2xl border-2 border-lime-300 hover:scale-105 hover:bg-green-500 transition"
                >
                  Play Again?
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      <InstructionsDialog open={showInstructions} onClose={() => setShowInstructions(false)} />
      <WordValidationDialog
        open={showWordValidation}
        word={pendingWord}
        onResponse={handleWordValidationResponse}
      />
      <StatsDialog
        stats={stats}
        open={showStats}
        onClose={() => setShowStats(false)}
      />
    </div>
  );
};

export default Index;
