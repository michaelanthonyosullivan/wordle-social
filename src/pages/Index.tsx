
import React, { useState, useCallback } from "react";
import { WordleBoard } from "@/components/WordleBoard";
import { Keyboard } from "@/components/Keyboard";
import { InstructionsDialog } from "@/components/InstructionsDialog";
import { WordValidationDialog } from "@/components/WordValidationDialog";
import { getRandomWord, validWords, addWordToList } from "@/utils/wordlist";
import { toast } from "@/hooks/use-toast";

const MAX_GUESSES = 6;
const WORD_LENGTH = 5;

const Index = () => {
  const [solution, setSolution] = useState(() => getRandomWord());
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [status, setStatus] = useState<"playing" | "won" | "lost">("playing");
  const [showInstructions, setShowInstructions] = useState(false);
  const [showWordValidation, setShowWordValidation] = useState(false);
  const [pendingWord, setPendingWord] = useState("");

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

  const handleWordValidationResponse = (addWord: boolean) => {
    if (addWord) {
      addWordToList(pendingWord);
      toast({
        title: "Word Added",
        description: `"${pendingWord}" has been added to the word list.`,
      });
      // Continue with the guess since the word is now valid
      const updatedGuesses = [...guesses, pendingWord];
      setGuesses(updatedGuesses);
      setCurrentGuess("");

      if (pendingWord === solution) {
        setStatus("won");
        toast({
          title: "🎉 Congratulations!",
          description: "You guessed the word!",
          className: "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-green-600 border-2 border-lime-300 shadow-2xl font-black text-white text-lg text-center max-w-md z-50",
        });
      } else if (updatedGuesses.length >= MAX_GUESSES) {
        setStatus("lost");
        toast({
          title: "💀 Game Over",
          description: `The word was "${solution}"`,
          variant: "destructive",
          className: "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black border-2 border-red-500 shadow-2xl font-black text-red-400 text-lg text-center max-w-md z-50",
        });
      }
    } else {
      // Clear the current guess and don't add to guesses
      setCurrentGuess("");
    }
    setShowWordValidation(false);
    setPendingWord("");
  };

  const submitGuess = useCallback(() => {
    if (status !== "playing" || currentGuess.length !== WORD_LENGTH) return;
    
    // Don't process if dialog is already open
    if (showWordValidation) return;
    
    const guess = currentGuess.toUpperCase();

    console.log("Checking word:", guess);
    console.log("Valid words set size:", validWords.size);
    console.log("Is word valid?", validWords.has(guess));

    if (!validWords.has(guess)) {
      console.log("Word not found, showing validation dialog");
      setPendingWord(guess);
      setShowWordValidation(true);
      return;
    }

    const updatedGuesses = [...guesses, guess];
    setGuesses(updatedGuesses);
    setCurrentGuess("");

    if (guess === solution) {
      setStatus("won");
      toast({
        title: "🎉 Congratulations!",
        description: "You guessed the word!",
        className: "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-green-600 border-2 border-lime-300 shadow-2xl font-black text-white text-lg text-center max-w-md z-50",
      });
    } else if (updatedGuesses.length >= MAX_GUESSES) {
      setStatus("lost");
      toast({
        title: "💀 Game Over",
        description: `The word was "${solution}"`,
        variant: "destructive",
        className: "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black border-2 border-red-500 shadow-2xl font-black text-red-400 text-lg text-center max-w-md z-50",
      });
    }
  }, [currentGuess, guesses, status, solution, showWordValidation]);

  // Handle physical keyboard events
  React.useEffect(() => {
    if (status !== "playing") return;
    
    const listener = (e: KeyboardEvent) => {
      // Don't process keyboard events if dialog is open
      if (showWordValidation) return;
      
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === "Backspace") { 
        e.preventDefault();
        handleBackspace(); 
      }
      else if (e.key === "Enter") { 
        e.preventDefault();
        submitGuess(); 
      }
      else if (/^[a-zA-Z]$/.test(e.key)) { 
        e.preventDefault();
        handleChar(e.key.toUpperCase()); 
      }
    };
    
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [handleChar, handleBackspace, submitGuess, status, showWordValidation]);

  // Roll back the most recent guess, resuming the game with the same word
  const rewind = () => {
    setGuesses((g) => g.slice(0, -1));
    setCurrentGuess("");
    setStatus("playing");
  };

  // Reset game state but keep the same word
  const restart = () => {
    setGuesses([]);
    setCurrentGuess("");
    setStatus("playing");
  };

  // Start a new game with a new random word
  const playAgain = () => {
    setSolution(getRandomWord());
    setGuesses([]);
    setCurrentGuess("");
    setStatus("playing");
  };

  return (
    <div className="flex w-full flex-col items-center justify-center flex-1 py-4 sm:py-10">
      <header className="w-full max-w-xl mb-8">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 ">
          <div className="text-center">
            <h1
              className="text-5xl font-black tracking-[0.12em] text-transparent bg-clip-text bg-gradient-to-br from-lime-300 via-green-400 to-emerald-500"
              style={{ filter: 'drop-shadow(0 0 18px rgba(34,197,94,0.55))' }}
            >
              WORDLE
            </h1>
            <p className="text-green-300/90 font-semibold text-sm italic">by Michael O'Sullivan</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => setShowInstructions(true)}
            className="text-green-300 bg-black/40 font-bold text-sm rounded-full border-2 border-green-500 hover:bg-green-500 hover:text-black px-5 py-2 shadow-md transition"
          >
            Help?
          </button>
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
        {(status === "won" || status === "lost") && (
          <div className="mt-6 text-center animate-fade-in">
            <button
              onClick={playAgain}
              className="mt-2 px-8 py-3 bg-green-600 text-white rounded-lg font-black text-lg uppercase tracking-wide shadow-green-900/60 shadow-2xl border-2 border-lime-300 hover:scale-105 hover:bg-green-500 transition"
            >
              Play Again?
            </button>
          </div>
        )}
      </main>
      <InstructionsDialog open={showInstructions} onClose={() => setShowInstructions(false)} />
      <WordValidationDialog 
        open={showWordValidation}
        word={pendingWord}
        onResponse={handleWordValidationResponse}
      />
    </div>
  );
};

export default Index;
