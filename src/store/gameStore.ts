import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Tile,
  Hand,
  HandHistoryEntry,
  generateDeck,
  shuffleDeck,
  calculateHandValue,
} from '@/lib/gameEngine';

export type GameStatus = 'idle' | 'playing' | 'game_over';
export type GameOverReason = 'win' | 'loss_value_bounds' | 'loss_empty_deck';

interface GameState {
  // Game Status
  status: GameStatus;
  gameOverReason: GameOverReason | null;
  score: number;

  // Deck State
  drawPile: Tile[];
  discardPile: Tile[];
  reshuffleCount: number;

  // Hand State
  currentHand: Hand | null;
  handHistory: HandHistoryEntry[];

  // Dynamic Tile Values
  dynamicValues: Record<string, number>; // e.g., { 'Red Dragon': 6, 'East Wind': 4 }

  // Actions
  startGame: () => void;
  drawInitialHand: () => void;
  placeBet: (betType: 'higher' | 'lower') => void;
  resetGame: () => void;
  quitGame: () => void;
}

const HAND_SIZE = 5;
const MAX_RESHUFFLES = 3;
const MAX_TILE_VALUE = 10;
const MIN_TILE_VALUE = 0;

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      status: 'idle',
      gameOverReason: null,
      score: 0,

      drawPile: [],
      discardPile: [],
      reshuffleCount: 0,

      currentHand: null,
      handHistory: [],

      dynamicValues: {},

      startGame: () => {
        const fullDeck = shuffleDeck(generateDeck());
        set({
          status: 'playing',
          gameOverReason: null,
          score: 0,
          drawPile: fullDeck,
          discardPile: [],
          reshuffleCount: 0,
          currentHand: null,
          handHistory: [],
          dynamicValues: {},
        });
        get().drawInitialHand();
      },

      drawInitialHand: () => {
        const { drawPile, dynamicValues } = get();
        if (drawPile.length < HAND_SIZE) {
          // Edge case: shouldn't happen on first draw, but safe to check
          return;
        }

        const newHandTiles = drawPile.slice(0, HAND_SIZE);
        const remainingDeck = drawPile.slice(HAND_SIZE);

        const currentHand: Hand = {
          tiles: newHandTiles,
          totalValue: calculateHandValue(newHandTiles, dynamicValues),
        };

        set({
          drawPile: remainingDeck,
          currentHand,
        });
      },

      placeBet: (betType) => {
        const {
          drawPile,
          discardPile,
          currentHand,
          handHistory,
          dynamicValues,
          reshuffleCount,
          score,
        } = get();

        if (!currentHand) return;

        let newDrawPile = [...drawPile];
        let newDiscardPile = [...discardPile, ...currentHand.tiles];
        let newReshuffleCount = reshuffleCount;

        // Check if we need to reshuffle
        if (newDrawPile.length < HAND_SIZE) {
          newReshuffleCount++;
          if (newReshuffleCount >= MAX_RESHUFFLES) {
            set({
              status: 'game_over',
              gameOverReason: 'loss_empty_deck',
            });
            return;
          }
          // Reshuffle discard into draw
          newDrawPile = shuffleDeck([...newDrawPile, ...newDiscardPile]);
          newDiscardPile = [];
        }

        // Draw new hand
        const newHandTiles = newDrawPile.slice(0, HAND_SIZE);
        newDrawPile = newDrawPile.slice(HAND_SIZE);

        // Calculate new hand value based on CURRENT dynamic values
        const newHandTotal = calculateHandValue(newHandTiles, dynamicValues);
        const newHand: Hand = {
          tiles: newHandTiles,
          totalValue: newHandTotal,
        };

        // Determine result of the bet
        const previousTotal = currentHand.totalValue;
        let result: 'win' | 'loss' | 'tie' = 'tie';

        if (newHandTotal > previousTotal && betType === 'higher') result = 'win';
        if (newHandTotal < previousTotal && betType === 'higher') result = 'loss';
        if (newHandTotal < previousTotal && betType === 'lower') result = 'win';
        if (newHandTotal > previousTotal && betType === 'lower') result = 'loss';
        // If equal, it's a tie. Neither win nor loss for the score, but we can treat it neutral.

        // Update score
        let newScore = score;
        if (result === 'win') newScore += 100;
        if (result === 'loss') newScore -= 50;

        // Update dynamic values based on the result
        const newDynamicValues = { ...dynamicValues };
        let gameOverTriggered = false;

        // The AC specifies: "Every time a non-number tile is part of a winning hand, its value increases by 1. 
        // If it is part of a losing hand, it decreases by 1 (specific to that tile)."
        // We evaluate this for the new hand that just won/lost the bet.
        if (result === 'win' || result === 'loss') {
          newHandTiles.forEach((tile) => {
            if (!tile.isNumber) {
              const currentValue = newDynamicValues[tile.name] ?? tile.baseValue;
              const modifier = result === 'win' ? 1 : -1;
              const updatedValue = currentValue + modifier;
              
              newDynamicValues[tile.name] = updatedValue;

              // Check for game over condition
              if (updatedValue >= MAX_TILE_VALUE || updatedValue <= MIN_TILE_VALUE) {
                gameOverTriggered = true;
              }
            }
          });
        }

        // Add to history
        const newHistoryEntry: HandHistoryEntry = {
          id: Date.now().toString(), // Simple unique ID
          hand: currentHand, // the hand we bet ON
          betType,
          result,
        };

        set({
          drawPile: newDrawPile,
          discardPile: newDiscardPile,
          reshuffleCount: newReshuffleCount,
          currentHand: {
            ...newHand,
            totalValue: calculateHandValue(newHandTiles, newDynamicValues), // Recalculate with potentially updated values
          },
          handHistory: [newHistoryEntry, ...handHistory],
          dynamicValues: newDynamicValues,
          score: newScore,
        });

        if (gameOverTriggered) {
          set({
            status: 'game_over',
            gameOverReason: 'loss_value_bounds',
          });
        }
      },

      resetGame: () => {
        set({
          status: 'idle',
          gameOverReason: null,
          score: 0,
          currentHand: null,
          handHistory: [],
        });
      },

      quitGame: () => {
        set({
          status: 'idle',
        });
      },
    }),
    {
      name: 'mahjong-betting-game-storage',
    }
  )
);
