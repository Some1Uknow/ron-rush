export type TileSuite = 'number' | 'dragon' | 'wind';
export type Prediction = 'higher' | 'lower';
export type RoundResult = 'win' | 'loss' | 'tie';

export interface Tile {
  id: string;
  suite: TileSuite;
  name: string;
  baseValue: number;
  isNumber: boolean;
}

export interface Hand {
  tiles: Tile[];
  totalValue: number;
}

export interface HandOdds {
  higher: number;
  lower: number;
  tie: number;
  combinations: number;
}

export interface ResolvedRound {
  result: RoundResult;
  revealedTotal: number;
  multiplier: number;
  chipDelta: number;
}

export const HAND_SIZE = 5;
export const STARTING_BANKROLL = 1000;
export const TARGET_BANKROLL = 2500;
export const MIN_WAGER = 100;

export const HONOR_NAMES = [
  'Red Dragon',
  'Green Dragon',
  'White Dragon',
  'East Wind',
  'South Wind',
  'West Wind',
  'North Wind',
] as const;

export type HonorName = (typeof HONOR_NAMES)[number];

export function generateDeck(): Tile[] {
  const deck: Tile[] = [];

  for (let value = 1; value <= 9; value += 1) {
    for (let copy = 0; copy < 4; copy += 1) {
      deck.push({
        id: `num_${value}_${copy}`,
        suite: 'number',
        name: `${value} Dots`,
        baseValue: value,
        isNumber: true,
      });
    }
  }

  ['Red', 'Green', 'White'].forEach((dragon) => {
    for (let copy = 0; copy < 4; copy += 1) {
      deck.push({
        id: `dragon_${dragon}_${copy}`,
        suite: 'dragon',
        name: `${dragon} Dragon`,
        baseValue: 5,
        isNumber: false,
      });
    }
  });

  ['East', 'South', 'West', 'North'].forEach((wind) => {
    for (let copy = 0; copy < 4; copy += 1) {
      deck.push({
        id: `wind_${wind}_${copy}`,
        suite: 'wind',
        name: `${wind} Wind`,
        baseValue: 5,
        isNumber: false,
      });
    }
  });

  return deck;
}

export function shuffleDeck(deck: Tile[], random: () => number = Math.random): Tile[] {
  const shuffled = [...deck];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[target]] = [shuffled[target], shuffled[index]];
  }

  return shuffled;
}

export function getTileValue(tile: Tile, dynamicValues: Record<string, number>): number {
  return tile.isNumber ? tile.baseValue : (dynamicValues[tile.name] ?? tile.baseValue);
}

export function calculateHandValue(tiles: Tile[], dynamicValues: Record<string, number>): number {
  return tiles.reduce((total, tile) => total + getTileValue(tile, dynamicValues), 0);
}

export function makeHand(tiles: Tile[], dynamicValues: Record<string, number>): Hand {
  return {
    tiles,
    totalValue: calculateHandValue(tiles, dynamicValues),
  };
}

function incrementBucket(buckets: Map<number, number>, value: number, amount: number): void {
  buckets.set(value, (buckets.get(value) ?? 0) + amount);
}

/**
 * Calculates exact, without-replacement probabilities for the next hand total.
 * Each tile is treated as distinct while the dynamic tile values are respected.
 */
export function calculateHandOdds(
  drawPile: Tile[],
  currentTotal: number,
  dynamicValues: Record<string, number>,
  knownTiles: Tile[] = []
): HandOdds {
  const knownIds = new Set(knownTiles.map((tile) => tile.id));
  const availableTiles = drawPile.filter((tile) => !knownIds.has(tile.id));
  const drawCount = HAND_SIZE - knownTiles.length;
  const knownTotal = calculateHandValue(knownTiles, dynamicValues);

  if (drawCount < 0 || availableTiles.length < drawCount) {
    return { higher: 0, lower: 0, tie: 0, combinations: 0 };
  }

  const states = Array.from({ length: drawCount + 1 }, () => new Map<number, number>());
  states[0].set(knownTotal, 1);

  for (const tile of availableTiles) {
    const value = getTileValue(tile, dynamicValues);

    for (let picked = drawCount - 1; picked >= 0; picked -= 1) {
      for (const [total, combinations] of states[picked]) {
        incrementBucket(states[picked + 1], total + value, combinations);
      }
    }
  }

  let higher = 0;
  let lower = 0;
  let tie = 0;

  for (const [total, combinations] of states[drawCount]) {
    if (total > currentTotal) higher += combinations;
    if (total < currentTotal) lower += combinations;
    if (total === currentTotal) tie += combinations;
  }

  const combinations = higher + lower + tie;
  if (combinations === 0) return { higher: 0, lower: 0, tie: 0, combinations: 0 };

  return {
    higher: higher / combinations,
    lower: lower / combinations,
    tie: tie / combinations,
    combinations,
  };
}

export function probabilityForPrediction(odds: HandOdds, prediction: Prediction): number {
  return prediction === 'higher' ? odds.higher : odds.lower;
}

export function calculatePayoutMultiplier(odds: HandOdds, prediction: Prediction): number {
  const selectedProbability = probabilityForPrediction(odds, prediction);
  const nonTieProbability = 1 - odds.tie;

  if (selectedProbability <= 0 || nonTieProbability <= 0) return 0;

  const conditionalProbability = selectedProbability / nonTieProbability;
  const rawMultiplier = 0.95 * ((1 - conditionalProbability) / conditionalProbability);
  const roundedDown = Math.floor(rawMultiplier * 4) / 4;

  return Math.min(4, Math.max(0.25, roundedDown));
}

export function getRiskLabel(multiplier: number): 'safe' | 'even' | 'bold' | 'jackpot' {
  if (multiplier <= 0.75) return 'safe';
  if (multiplier <= 1.25) return 'even';
  if (multiplier <= 2) return 'bold';
  return 'jackpot';
}

export function roundChips(value: number): number {
  return Math.round(value / 10) * 10;
}

export function wagerFromPercent(bankroll: number, percent: number): number {
  if (bankroll <= MIN_WAGER) return bankroll;
  const proposed = roundChips(bankroll * percent);
  return Math.min(bankroll, Math.max(MIN_WAGER, proposed));
}

export function resolveRound(
  currentTotal: number,
  revealedTiles: Tile[],
  dynamicValues: Record<string, number>,
  prediction: Prediction,
  wager: number,
  odds: HandOdds
): ResolvedRound {
  const revealedTotal = calculateHandValue(revealedTiles, dynamicValues);
  const multiplier = calculatePayoutMultiplier(odds, prediction);
  let result: RoundResult = 'tie';

  if (
    (prediction === 'higher' && revealedTotal > currentTotal) ||
    (prediction === 'lower' && revealedTotal < currentTotal)
  ) {
    result = 'win';
  } else if (revealedTotal !== currentTotal) {
    result = 'loss';
  }

  const chipDelta = result === 'win' ? roundChips(wager * multiplier) : result === 'loss' ? -wager : 0;

  return { result, revealedTotal, multiplier, chipDelta };
}

export function applyHonorShift(
  revealedTiles: Tile[],
  dynamicValues: Record<string, number>,
  result: RoundResult
): Record<string, number> {
  if (result === 'tie') return dynamicValues;

  const modifier = result === 'win' ? 1 : -1;
  const nextValues = { ...dynamicValues };
  const seenHonors = new Set<string>();

  for (const tile of revealedTiles) {
    if (tile.isNumber || seenHonors.has(tile.name)) continue;
    seenHonors.add(tile.name);
    const current = nextValues[tile.name] ?? tile.baseValue;
    nextValues[tile.name] = Math.min(9, Math.max(1, current + modifier));
  }

  return nextValues;
}
