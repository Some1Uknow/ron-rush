# Ron Rush

A fast Mahjong-tile prediction game set in the Dragon Parlor. Read the wall, risk virtual chips, and beat the house before the table runs dry.

Built for [Indies on Solana IOS2](https://indiesonsolana.com).

## How it plays

You get a 5-tile hand. Add up the value, read the remaining wall, then call whether the next hand lands **higher** or **lower**.

- Number tiles (dots 1–9) are fixed — what you see is what you get.
- Dragons and winds start at 5, then shift between 1–9 after a win or loss. Their new value affects later odds.
- Start with **1,000 virtual chips** and win as soon as you reach **2,500**.
- A run lasts one 64-tile wall: you lose if you go broke or cannot reach the target within 11 calls.
- Select a 10%, 25%, 50%, or all-in wager. The reward adjusts to the exact odds, so long shots pay more.
- You get two Peeks and one Recut per run to make a difficult call less blind.

Lock the bet, then watch all five tiles reveal one at a time. Ties return the wager; correct calls earn chips and misses cost the stake.

Runs are intended to take 4–6 minutes and use virtual chips only — no wallet or token wagering is required.

## What's in the build right now

Playable web prototype — full loop, no wallet needed yet.

- Dragon Parlor home screen, dealer art, victory/defeat illustration states, and local leaderboard
- Full game board: live odds, wager chips, Peek/Recut powers, wall status, honor heat, and table ledger
- Exact without-replacement odds for every higher/lower call
- Explicit lock → reveal → resolve state machine with a five-tile suspense sequence
- Local top-5 records ranked by victory, ending bankroll, and speed
- Original optimized WebP illustration assets and motion-first mobile layout

This is a complete browser prototype. It works end to end with no wallet connection.

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
