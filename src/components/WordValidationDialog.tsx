
import React, { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface WordValidationDialogProps {
  open: boolean;
  word: string;
  onResponse: (addWord: boolean) => void;
}

export const WordValidationDialog: React.FC<WordValidationDialogProps> = ({
  open,
  word,
  onResponse,
}) => {
  const [selectedButton, setSelectedButton] = useState<"no" | "yes">("no");

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        setSelectedButton(prev => prev === "no" ? "yes" : "no");
      } else if (e.key === "Enter") {
        onResponse(selectedButton === "yes");
      } else if (e.key === "Escape") {
        onResponse(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [open, selectedButton, onResponse]);

  // Reset selection when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedButton("no");
    }
  }, [open]);

  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="bg-[#0c1812] border-green-700 text-green-50">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-amber-300 text-lg font-black">Word Not Recognized</AlertDialogTitle>
          <AlertDialogDescription className="text-green-100">
            The word "{word}" is not in our word list. Would you like to add it to the list for future games?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel 
            onClick={() => onResponse(false)} 
            className={`text-amber-200 border-2 border-amber-500/60 hover:border-amber-400 transition-all duration-200 transform ${
              selectedButton === "no" 
                ? "ring-4 ring-amber-400 bg-amber-500 text-black border-amber-300 scale-105 shadow-lg font-black" 
                : "hover:bg-amber-500/20 hover:scale-102 bg-transparent"
            }`}
          >
            No
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={() => onResponse(true)} 
            className={`transition-all duration-200 transform ${
              selectedButton === "yes" 
                ? "ring-4 ring-lime-300 bg-green-600 text-white scale-105 shadow-lg border-green-300 font-black" 
                : "bg-green-700 text-white border-2 border-green-400 hover:bg-green-600 hover:scale-102"
            }`}
          >
            Yes, Add Word
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
