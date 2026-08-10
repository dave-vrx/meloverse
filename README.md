# MELOVERSE — Cosmic Idle Melon Empire

An addictive, graphically-rich **multiplayer idle/clicker game** for the web.
Tap melons, build a cosmic farm empire, prestige for eternal power, and climb the
**live global leaderboard**.

Made with a lot of love by **Dave-VR**.

---

## Features (the best idle-game ideas, combined)

- **Tap-to-harvest** with juicy particle effects, floating numbers and a **combo meter**
- **12 unlockable generators** — from Melon Vines to the Melonverse itself
- **40+ upgrades** — click power, building boosts, global multipliers
- **Prestige / Ascension system** — reset for **Seeds** that give permanent production (+1% each, upgradeable)
- **Crystal economy** — premium tokens from achievements, daily rewards and golden melons
- **Golden Melon events** — Frenzy (x7), Lucky (777x), Jackpot, Tap Storm and Time Warp
- **36 achievements** that reward crystals
- **Daily login streak** — come back every day for free crystals
- **Offline progress** — your melons keep growing while you are away (up to 8h+, expandable)
- **Ranks** — rise from Melon Seedling to Melon God
- **Live global leaderboard** — shared by every player, no accounts needed
- **Hold-to-autoclick**, WebAudio sound FX, animated starfield background
- **Mobile friendly** — responsive layout with a bottom tab bar

## Tech

- Pure **HTML + CSS + JavaScript** — zero frameworks, zero build step, zero backend
- Progress saved **locally** in `localStorage` — private, no login, offline-friendly
- Leaderboard uses **MantleDB** (https://mantledb.sh) — a **free, no-login, keyless JSON store**.
  Every player reads/writes the same shared namespace, so the board is truly global.
  CORS-enabled, works straight from GitHub Pages.

## Play / Deploy

Just open `index.html`, or host on GitHub Pages:

1. Push this folder to a GitHub repository.
2. Repo -> Settings -> Pages -> deploy from `main` branch, root folder.
3. Done. Everyone who opens the page shares one global leaderboard.

## Files

| File             | Purpose                                        |
|------------------|------------------------------------------------|
| `index.html`     | Page structure, modals, HUD                    |
| `style.css`      | The whole cosmic look & mobile layout          |
| `game.js`        | Game engine: economy, prestige, events, saves  |
| `leaderboard.js` | Global leaderboard sync via MantleDB           |

## Credits

- Made by **Dave-VR**
- Free keyless cloud storage: [MantleDB](https://mantledb.sh)
