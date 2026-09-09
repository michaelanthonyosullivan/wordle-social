# Wordle Social — roadmap & feature brief

**Audience:** you and your friends (private group game; no accounts/server needed — keep it local-first, honour-system).

## Core social loop (build first)

1. **Daily shared word** — everyone plays the same seeded word per day, so scores are comparable and it becomes a daily "did you get today's?".
2. **Stats & streaks** — persist in `localStorage`: win streak, best streak, total plays/wins, and the classic guess-distribution (how many solved in 1…6).
3. **Emoji share grid** — one button copies a spoiler-safe result (`Wordle Social 1/6…` + a 🟩🟨⬛ grid) to paste into the group chat. This is the core "friends talk smack" feature.

## Carry across from `wordle-mos`

Keep the current polished green/black design, the working game logic, the **rewind** button and its forgiveness angle, the **close ✕ on banners**, responsive mobile layout, the green "W" favicon, and the "add a word" handler.

## Signature / differentiators (pick and layer on)

- **Unlimited practice mode** so people can train before the daily showdown.
- **Guess-count / word-length** options (4/5/6-letter words, adjustable tries).
- **Rewind system** as a feature: start with N free rewinds, or earn a rewind every couple of guesses.
- **Friend challenge / "beat the share"** rematch (private replay against a posted friend result).
- **Player-submitted word packs** — friends add words; use them to build themed, voted "house" word lists.

## Explicitly NOT building (overkill for a friends-only game)

Accounts, server-side leaderboards, logins, real matchmaking.

## Suggested build order (MVP then iterate)

1. ✅ Daily seed + persisted streak/stats modal — DONE (see `src/utils/daily.ts`, `src/utils/stats.ts`, `StatsDialog`)
2. ✅ Emoji share-to-clipboard button — DONE (see `src/utils/share.ts`; the 📣 Share button copies the result after each round)
3. ✅ Unlimited / free-play mode — DONE (Daily / Free Practice mode toggle)
4. Settings variations (length / tries)
5. Friend "beat my score" rematch + word packs

## Suggested first session

- Confirm daily seed strategy (fixed date-based word vs. rotating)
- Decide streak reset rules
- Pick which of the MVP three to build first
