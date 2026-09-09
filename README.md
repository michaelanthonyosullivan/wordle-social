# Wordle by Michael O'Sullivan

A word-guessing game built with **Vite**, **React**, **TypeScript** and **Tailwind CSS**.

Guess the secret 5-letter word in six tries. Each guess colours the tiles to show how close you are:

- **Green** — the letter is correct and in the right spot.
- **Yellow** — the letter is in the word but in the wrong spot.
- **Gray** — the letter is not in the word.

Not sure your guess is a real word? The game will offer to add it to the word list for future games (stored in your browser).

## Play modes

- **Daily** — everyone plays the same word each calendar day, picked purely from the built-in word list by the date, so scores are comparable with friends. Results are recorded once per day.
- **Free Practice** — unlimited random-word rounds for training. Nothing is scored or counted.

## Social features (local-first, no account/server)

- **Stats & streaks** — wins, win %, current & best streak, and the classic 1–6 guess distribution, persisted in `localStorage`. Streaks cover consecutive **daily** wins only; missing a day or losing breaks the current streak.
- **Emoji share grid** — after a round, tap **📣 Share** to copy a spoiler-safe result (`Wordle Social — Daily #1234 3/6` plus the 🟩🟨⬛ grid) into the clipboard for the group chat.
- **Rewind** — back out a mis-tapped guess mid-round before locking in your result.

## Getting started

Requires [Node.js](https://nodejs.org/) and npm.

```sh
npm install
npm run dev
```

The dev server runs at <http://localhost:8080>.

## Commands

| Command           | Description                              |
| ----------------- | ---------------------------------------- |
| `npm run dev`     | Start the development server             |
| `npm run build`   | Type-check and build for production      |
| `npm run preview` | Preview the production build             |
| `npm run lint`    | Lint the source with ESLint              |

## Project structure

```
src/
  components/        Wordle game UI + themed UI primitives (components/ui)
  hooks/             Shared hooks (e.g. toast)
  lib/               Utilities
  pages/             Route pages
  utils/             Word list, daily seed, stats & share helpers
docs/
  roadmap.md         Feature brief and trailing ideas (length/try settings, rewinds, word packs, "beat my score")
```
