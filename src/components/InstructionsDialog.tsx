
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { WordleBoard } from "./WordleBoard";

// Help modal describing how to play
export const InstructionsDialog: React.FC<{open: boolean, onClose: () => void}> = ({open, onClose}) => (
  <Dialog open={open} onOpenChange={v => !v && onClose()}>
    <DialogContent className="max-w-md rounded-xl border-green-700 bg-[#0c1812] text-green-50">
      <DialogHeader>
        <DialogTitle className="text-lime-300 text-xl font-black tracking-wide">How to play</DialogTitle>
        <DialogDescription className="text-green-100">
          Guess the 5-letter word in 6 tries.
          <ul className="list-disc list-inside mt-2 text-left text-sm leading-6 text-green-100">
            <li>
              Each guess must be a valid 5-letter English word.
            </li>
            <li>
              After each guess, the colour of the tiles will change to show how close your guess was to the word.
            </li>
            <li>
              <span className="inline-block rounded font-bold px-2 bg-green-500 text-white mx-1 w-16 text-center border border-lime-300">Green</span> = letter is correct and in the right spot.
            </li>
            <li>
              <span className="inline-block rounded font-bold px-2 bg-amber-400 text-black mx-1 w-16 text-center">Yellow</span> = letter is in the word but in the wrong spot.
            </li>
            <li>
              <span className="inline-block rounded font-bold px-2 bg-slate-500 text-white mx-1 w-16 text-center">Gray</span> = letter is not in the word.
            </li>
          </ul>
        </DialogDescription>
      </DialogHeader>
      <div className="mt-3 rounded-lg p-3 bg-black/40">
        <WordleBoard
          guesses={["LEMON","CLEAT","PRINT", "PLANT"]}
          currentGuess=""
          solution="PLANT" // Mock data for visual
          maxGuesses={4}
        />
      </div>
    </DialogContent>
  </Dialog>
);
