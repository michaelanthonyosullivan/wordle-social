# Wordle by Michael O'Sullivan

A word-guessing game built with **Vite**, **React**, **TypeScript** and **Tailwind CSS**.

Guess the secret 5-letter word in six tries. Each guess colours the tiles to show how close you are:

- **Green** — the letter is correct and in the right spot.
- **Yellow** — the letter is in the word but in the wrong spot.
- **Gray** — the letter is not in the word.

Not sure your guess is a real word? The game will offer to add it to the word list for future games (stored in your browser).

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
  utils/             Word list + game helpers
```
