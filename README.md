# 🍉 SUIKAVERSE — Watermelon Idle Multiverse

The all-in-one watermelon multiverse: idle farming, the full **Suika** merge game,
mini games, quests, a collection, skins and a **live global leaderboard + chat**.

Made with 💚 by **Dave-VR**.

---

## Features

- **Tap-to-harvest** with juicy particles, floating numbers and a **combo meter**
- **12 unlockable generators** — from Melon Vines to the Melonverse itself
- **40+ upgrades** — click power, building boosts, global multipliers
- **Prestige / Ascension** — reset for 🌱 Seeds that give permanent production (+1% each, upgradeable) and unlock prestige skins
- **💎 Crystal economy** — daily rewards, achievements, quests, golden melons, crates, roulette & Suika milestones
- **Built-in Suika game** — 11 fruits, physics merges, chain combos, death line, local best; every merge earns your empire melons and a watermelon grants a legendary drop
- **Mini games** — Suika, Whack-a-Melon (gold melons ×5) and the Crystal Roulette wheel
- **Daily & Story quests** — fresh daily quests roll at midnight, plus a one-time story path
- **Golden Melon events** — catch it for big melon + crystal bonuses (Frenzy, Lucky, etc.)
- **Crates & Collection** — 27-item collection of rare drops, from Common to Legendary
- **36 achievements** that reward crystals
- **Daily login streak** — return every day for free crystals
- **Offline progress** — melons keep growing while you're away (8h+, expandable)
- **Ranks** — rise from Melon Seedling to Melon God
- **Live global leaderboard** — shared by every player, no accounts; your crystal balance updates in real time when you buy
- **Live global chat** — polite melon talk across the multiverse
- **Skins** — 11 visual skins for the big melon (level-gated + prestige-gated)
- **Random global events** — Meteor Shower, Crystal Rain, Gold Rush, Fruit Rush, Turbo — the whole multiverse at once
- **Mobile friendly** — responsive layout with a bottom tab bar; mouse + touch + keyboard (Space/arrows) for Suika
- **WebAudio** sound FX with a mute toggle, animated starfield background

## Tech

- Pure **HTML + CSS + JavaScript** — zero frameworks, zero build step, zero backend
- Progress saved **locally** in `localStorage` — private, no login, offline-friendly
- Realtime features use **MantleDB** (https://mantledb.sh) — a free, no-login, keyless JSON store.
  Every player reads/writes the same shared namespace, so leaderboard, chat and events are truly global.
  CORS-enabled, works straight from GitHub Pages.

## Play / Deploy

Just open `index.html`, or host on GitHub Pages:

1. Push this folder to a GitHub repository.
2. Repo -> Settings -> Pages -> deploy from `main` branch, root folder.
3. Done. Everyone who opens the page shares one global multiverse.

Live demo: **https://dave-vrx.github.io/meloverse/**

## Files

| File             | Purpose                                              |
|------------------|------------------------------------------------------|
| `index.html`     | Page structure, views, modals, HUD                   |
| `style.css`      | The whole cosmic look & mobile layout                |
| `game.js`        | Idle engine: economy, prestige, quests, crates, skins, events |
| `suika.js`       | The full Suika merge mini game + idle payout bridge  |
| `leaderboard.js` | Global leaderboard + live crystal balance via MantleDB |
| `chat.js`        | Global chat via MantleDB                             |

## Credits

- Made by **Dave-VR**
- Free keyless cloud storage: [MantleDB](https://mantledb.sh)
