# Ron Rush

A fast mahjong tile prediction game. Read the table, call higher or lower, try not to blow up the dragons.

Built for [Indies on Solana IOS2](https://indiesonsolana.com).

## How it plays

You get a 5-tile hand. Add up the value. Bet whether the next hand lands **higher** or **lower**.

- Number tiles (dots 1–9) are fixed — what you see is what you get.
- Dragons and winds start at 5, but they **shift over time**. Show up in a winning hand and that tile gets stronger. Show up in a losing hand and it cools off.
- The run ends when any dragon/wind hits **0 or 10**, or you burn through **3 deck reshuffles**.

One call per round. Runs are short. The table changes underneath you if you stop paying attention.

**Scoring:** +100 on a correct call, -50 on a miss. Ties are neutral.

## What's in the build right now

Playable web prototype — full loop, no wallet needed yet.

- Home screen with table preview and local leaderboard
- Full game board: current hand, bet controls, deck stats, hand history
- Dynamic tile values tracked live (dragons/winds heat up and cool down)
- Run summary screen with high score entry
- Local top-5 leaderboard (browser storage)
- Mahjong tile sprites, table layout, hand transitions, score animations

This is the game. It works end to end in the browser today.

## What's shipping next

Target: **Ron Rush v1.0 on Solana Mobile** during the IOS2 residency.

- Wallet connect — your run, your wallet
- Onchain score submission after each game
- Weekly leaderboard players can actually compete on
- Solana Mobile build + dApp Store listing on Seeker
- Closed alpha with real players stress-testing the loop

Blockchain stuff stays in the background. You play because the loop is fun, not because someone waved a token at you.

## Run it locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Needs Node 18+.

## Stack

Next.js · Tailwind · Framer Motion · Zustand

## License

MIT — see [LICENSE](LICENSE).