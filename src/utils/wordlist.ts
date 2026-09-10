import { ANSWER_WORDS, GUESS_WORDS_RAW } from "./wordData";

// Two-tier word model, mirroring how Wordle itself separates the lists:
// - ANSWER_WORDS: the curated pool the secret word is drawn from (common,
//   guessable words). This is what getDailyWord() / getRandomWord() sample.
// - validWords: everything accepted as a *guess* = answers + the full
//   dictionary + player-added custom words (custom words stay guess-only).

const GUESS_WORDS = GUESS_WORDS_RAW.split(/\s+/).filter(Boolean);

export const validWords = new Set<string>([...ANSWER_WORDS, ...GUESS_WORDS]);

/** Draw a secret word from the curated answer list only (never custom words). */
export function getRandomWord() {
  return ANSWER_WORDS[Math.floor(Math.random() * ANSWER_WORDS.length)];
}

export function addWordToList(word: string) {
  const upperWord = word.toUpperCase();
  validWords.add(upperWord);

  // Persist so it's accepted as a guess in future sessions.
  const storedWords = JSON.parse(localStorage.getItem("customWords") || "[]");
  if (!storedWords.includes(upperWord)) {
    storedWords.push(upperWord);
    localStorage.setItem("customWords", JSON.stringify(storedWords));
  }
}

// Load custom words from localStorage on module initialization (guess-only).
(() => {
  try {
    const storedWords = JSON.parse(localStorage.getItem("customWords") || "[]");
    storedWords.forEach((word: string) => validWords.add(word));
  } catch (error) {
    console.warn("Failed to load custom words from localStorage:", error);
  }
})();
