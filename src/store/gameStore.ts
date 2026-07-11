import { create } from 'zustand';
import {
  applyHonorShift,
  calculateHandOdds,
  calculateHandValue,
  generateDeck,
  HAND_SIZE,
  Hand,
  HandOdds,
  makeHand,
  Prediction,
  resolveRound,
  RoundResult,
  shuffleDeck,
  STARTING_BANKROLL,
  TARGET_BANKROLL,
  Tile,
  wagerFromPercent,
} from '@/lib/gameEngine';

export type GameStatus = 'idle' | 'playing' | 'game_over';
export type GamePhase = 'decision' | 'locked' | 'revealing' | 'round_complete' | 'game_over';
export type GameOverReason = 'win_target' | 'loss_bankroll' | 'loss_wall';
export type WagerPreset = 'ten' | 'quarter' | 'half' | 'all_in';

export interface PowerCharges {
  peek: number;
  recut: number;
}

export interface PendingRound {
  tiles: Tile[];
  revealedTotal: number;
  prediction: Prediction;
  wager: number;
  odds: HandOdds;
  multiplier: number;
  result: RoundResult;
  chipDelta: number;
}

export interface LastResult {
  result: RoundResult;
  chipDelta: number;
  wager: number;
  multiplier: number;
  revealedTotal: number;
}

export interface HandHistoryEntry {
  id: string;
  baselineHand: Hand;
  revealedHand: Hand;
  prediction: Prediction;
  odds: HandOdds;
  wager: number;
  multiplier: number;
  result: RoundResult;
  chipDelta: number;
  bankrollAfter: number;
  valuesAfter: Record<string, number>;
}

interface GameState {
  status: GameStatus;
  phase: GamePhase;
  gameOverReason: GameOverReason | null;

  bankroll: number;
  targetBankroll: number;
  round: number;
  maxRounds: number;

  drawPile: Tile[];
  discardPile: Tile[];
  currentHand: Hand | null;
  handHistory: HandHistoryEntry[];
  dynamicValues: Record<string, number>;

  selectedPrediction: Prediction | null;
  selectedWagerPreset: WagerPreset;
  wager: number;
  powers: PowerCharges;
  peekedTile: Tile | null;

  pendingRound: PendingRound | null;
  revealIndex: number;
  lastResult: LastResult | null;

  startGame: () => void;
  selectPrediction: (prediction: Prediction) => void;
  setWagerPreset: (preset: WagerPreset) => void;
  usePeek: () => void;
  useRecut: () => void;
  lockBet: () => void;
  startReveal: () => void;
  advanceReveal: () => void;
  resolveRound: () => void;
  continueRound: () => void;
  resetGame: () => void;
  quitGame: () => void;
}

const wagerPercentages: Record<Exclude<WagerPreset, 'all_in'>, number> = {
  ten: 0.1,
  quarter: 0.25,
  half: 0.5,
};

function getWager(bankroll: number, preset: WagerPreset): number {
  if (preset === 'all_in') return bankroll;
  return wagerFromPercent(bankroll, wagerPercentages[preset]);
}

const idleState = {
  status: 'idle' as const,
  phase: 'decision' as const,
  gameOverReason: null,
  bankroll: STARTING_BANKROLL,
  targetBankroll: TARGET_BANKROLL,
  round: 0,
  maxRounds: 0,
  drawPile: [] as Tile[],
  discardPile: [] as Tile[],
  currentHand: null as Hand | null,
  handHistory: [] as HandHistoryEntry[],
  dynamicValues: {} as Record<string, number>,
  selectedPrediction: null as Prediction | null,
  selectedWagerPreset: 'quarter' as WagerPreset,
  wager: wagerFromPercent(STARTING_BANKROLL, wagerPercentages.quarter),
  powers: { peek: 2, recut: 1 } as PowerCharges,
  peekedTile: null as Tile | null,
  pendingRound: null as PendingRound | null,
  revealIndex: 0,
  lastResult: null as LastResult | null,
};

export const useGameStore = create<GameState>()((set, get) => ({
  ...idleState,

  startGame: () => {
    const fullDeck = shuffleDeck(generateDeck());
    const initialTiles = fullDeck.slice(0, HAND_SIZE);
    const drawPile = fullDeck.slice(HAND_SIZE);

    set({
      status: 'playing',
      phase: 'decision',
      gameOverReason: null,
      bankroll: STARTING_BANKROLL,
      targetBankroll: TARGET_BANKROLL,
      round: 0,
      maxRounds: Math.floor(drawPile.length / HAND_SIZE),
      drawPile,
      discardPile: [],
      currentHand: makeHand(initialTiles, {}),
      handHistory: [],
      dynamicValues: {},
      selectedPrediction: null,
      selectedWagerPreset: 'quarter',
      wager: getWager(STARTING_BANKROLL, 'quarter'),
      powers: { peek: 2, recut: 1 },
      peekedTile: null,
      pendingRound: null,
      revealIndex: 0,
      lastResult: null,
    });
  },

  selectPrediction: (prediction) => {
    if (get().phase !== 'decision') return;
    set({ selectedPrediction: prediction });
  },

  setWagerPreset: (preset) => {
    const { phase, bankroll } = get();
    if (phase !== 'decision') return;
    set({ selectedWagerPreset: preset, wager: getWager(bankroll, preset) });
  },

  usePeek: () => {
    const { phase, powers, drawPile, peekedTile } = get();
    if (phase !== 'decision' || powers.peek <= 0 || peekedTile || drawPile.length === 0) return;

    set({
      peekedTile: drawPile[0],
      powers: { ...powers, peek: powers.peek - 1 },
    });
  },

  useRecut: () => {
    const { phase, powers, drawPile, peekedTile } = get();
    if (phase !== 'decision' || powers.recut <= 0 || !peekedTile || drawPile.length < HAND_SIZE) return;

    const recutPile = shuffleDeck(drawPile);
    set({
      drawPile: recutPile,
      peekedTile: recutPile[0],
      powers: { ...powers, recut: powers.recut - 1 },
    });
  },

  lockBet: () => {
    const {
      phase,
      currentHand,
      drawPile,
      dynamicValues,
      selectedPrediction,
      wager,
      peekedTile,
    } = get();

    if (
      phase !== 'decision' ||
      !currentHand ||
      !selectedPrediction ||
      wager <= 0 ||
      drawPile.length < HAND_SIZE
    ) {
      return;
    }

    const knownTiles = peekedTile ? [peekedTile] : [];
    const odds = calculateHandOdds(drawPile, currentHand.totalValue, dynamicValues, knownTiles);
    const tiles = drawPile.slice(0, HAND_SIZE);
    const resolved = resolveRound(
      currentHand.totalValue,
      tiles,
      dynamicValues,
      selectedPrediction,
      wager,
      odds
    );

    set({
      phase: 'locked',
      pendingRound: {
        tiles,
        revealedTotal: resolved.revealedTotal,
        prediction: selectedPrediction,
        wager,
        odds,
        multiplier: resolved.multiplier,
        result: resolved.result,
        chipDelta: resolved.chipDelta,
      },
      revealIndex: 0,
    });
  },

  startReveal: () => {
    if (get().phase !== 'locked') return;
    set({ phase: 'revealing', revealIndex: 0 });
  },

  advanceReveal: () => {
    const { phase, pendingRound, revealIndex } = get();
    if (phase !== 'revealing' || !pendingRound) return;
    set({ revealIndex: Math.min(pendingRound.tiles.length, revealIndex + 1) });
  },

  resolveRound: () => {
    const {
      phase,
      pendingRound,
      revealIndex,
      currentHand,
      dynamicValues,
      bankroll,
      drawPile,
      discardPile,
      handHistory,
      round,
      maxRounds,
      targetBankroll,
    } = get();

    if (
      phase !== 'revealing' ||
      !pendingRound ||
      !currentHand ||
      revealIndex < pendingRound.tiles.length
    ) {
      return;
    }

    const nextDynamicValues = applyHonorShift(pendingRound.tiles, dynamicValues, pendingRound.result);
    const revealedHand: Hand = {
      tiles: pendingRound.tiles,
      totalValue: pendingRound.revealedTotal,
    };
    const nextHand = {
      tiles: pendingRound.tiles,
      totalValue: calculateHandValue(pendingRound.tiles, nextDynamicValues),
    };
    const nextBankroll = Math.max(0, bankroll + pendingRound.chipDelta);
    const nextRound = round + 1;

    let gameOverReason: GameOverReason | null = null;
    if (nextBankroll >= targetBankroll) gameOverReason = 'win_target';
    if (nextBankroll <= 0) gameOverReason = 'loss_bankroll';
    if (!gameOverReason && nextRound >= maxRounds) gameOverReason = 'loss_wall';

    const historyEntry: HandHistoryEntry = {
      id: `${Date.now()}-${nextRound}`,
      baselineHand: currentHand,
      revealedHand,
      prediction: pendingRound.prediction,
      odds: pendingRound.odds,
      wager: pendingRound.wager,
      multiplier: pendingRound.multiplier,
      result: pendingRound.result,
      chipDelta: pendingRound.chipDelta,
      bankrollAfter: nextBankroll,
      valuesAfter: nextDynamicValues,
    };

    set({
      status: gameOverReason ? 'game_over' : 'playing',
      phase: gameOverReason ? 'game_over' : 'round_complete',
      gameOverReason,
      bankroll: nextBankroll,
      round: nextRound,
      drawPile: drawPile.slice(HAND_SIZE),
      discardPile: [...discardPile, ...currentHand.tiles],
      currentHand: nextHand,
      handHistory: [historyEntry, ...handHistory],
      dynamicValues: nextDynamicValues,
      selectedPrediction: null,
      peekedTile: null,
      pendingRound: null,
      revealIndex: 0,
      lastResult: {
        result: pendingRound.result,
        chipDelta: pendingRound.chipDelta,
        wager: pendingRound.wager,
        multiplier: pendingRound.multiplier,
        revealedTotal: pendingRound.revealedTotal,
      },
    });
  },

  continueRound: () => {
    const { phase, bankroll } = get();
    if (phase !== 'round_complete') return;
    set({
      phase: 'decision',
      selectedPrediction: null,
      selectedWagerPreset: 'quarter',
      wager: getWager(bankroll, 'quarter'),
      peekedTile: null,
      lastResult: null,
    });
  },

  resetGame: () => set(idleState),

  quitGame: () => set(idleState),
}));
