export type TileSuite = 'number' | 'dragon' | 'wind';

export interface Tile {
  id: string; // Unique identifier for the tile in the deck
  suite: TileSuite;
  name: string; // e.g., '1 Dots', 'Red Dragon', 'East Wind'
  baseValue: number; // Face value for numbers, 5 for non-numbers initially
  isNumber: boolean;
}

export interface Hand {
  tiles: Tile[];
  totalValue: number;
}

export interface HandHistoryEntry {
  id: string;
  hand: Hand;
  betType: 'higher' | 'lower' | null;
  result: 'win' | 'loss' | 'tie' | null;
}

// Generate the initial deck based on the subset
export function generateDeck(): Tile[] {
  const deck: Tile[] = [];

  // Numbers (Let's use just one suit, e.g., Dots 1-9 for simplicity, 4 of each)
  for (let i = 1; i <= 9; i++) {
    for (let j = 0; j < 4; j++) {
      deck.push({
        id: `num_${i}_${j}`,
        suite: 'number',
        name: `${i} Dots`,
        baseValue: i,
        isNumber: true,
      });
    }
  }

  // Dragons (Red, Green, White - 4 of each)
  const dragons = ['Red', 'Green', 'White'];
  dragons.forEach((dragon) => {
    for (let j = 0; j < 4; j++) {
      deck.push({
        id: `dragon_${dragon}_${j}`,
        suite: 'dragon',
        name: `${dragon} Dragon`,
        baseValue: 5,
        isNumber: false,
      });
    }
  });

  // Winds (East, South, West, North - 4 of each)
  const winds = ['East', 'South', 'West', 'North'];
  winds.forEach((wind) => {
    for (let j = 0; j < 4; j++) {
      deck.push({
        id: `wind_${wind}_${j}`,
        suite: 'wind',
        name: `${wind} Wind`,
        baseValue: 5,
        isNumber: false,
      });
    }
  });

  return deck;
}

// Fisher-Yates shuffle
export function shuffleDeck(deck: Tile[]): Tile[] {
  const newDeck = [...deck];
  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
  }
  return newDeck;
}

// Calculate the total value of a hand given the current dynamic values
export function calculateHandValue(
  tiles: Tile[],
  dynamicValues: Record<string, number>
): number {
  return tiles.reduce((total, tile) => {
    if (tile.isNumber) {
      return total + tile.baseValue;
    }
    // For non-number tiles, use the dynamic value or fallback to base
    return total + (dynamicValues[tile.name] ?? tile.baseValue);
  }, 0);
}
