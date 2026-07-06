import React from 'react';
import { cn } from '@/lib/utils';
import { Tile } from '@/lib/gameEngine';

interface MahjongTileProps {
  tile: Tile;
  currentValue?: number;
  className?: string;
  isMini?: boolean;
  size?: 'live' | 'mini' | 'rack' | 'river';
  orientation?: 'upright' | 'left' | 'right' | 'top';
  faceDown?: boolean;
  fanIndex?: number;
  muted?: boolean;
}

const pipLayouts: Record<number, Array<[number, number]>> = {
  1: [[50, 48]],
  2: [[36, 30], [64, 66]],
  3: [[34, 28], [50, 48], [66, 68]],
  4: [[34, 28], [66, 28], [34, 68], [66, 68]],
  5: [[34, 28], [66, 28], [50, 48], [34, 68], [66, 68]],
  6: [[34, 24], [66, 24], [34, 48], [66, 48], [34, 72], [66, 72]],
  7: [[34, 22], [66, 22], [50, 38], [34, 54], [66, 54], [34, 74], [66, 74]],
  8: [[34, 20], [66, 20], [34, 38], [66, 38], [34, 56], [66, 56], [34, 74], [66, 74]],
  9: [[32, 20], [50, 20], [68, 20], [32, 48], [50, 48], [68, 48], [32, 76], [50, 76], [68, 76]],
};

const windGlyphs: Record<string, string> = {
  East: '東',
  South: '南',
  West: '西',
  North: '北',
};

const sizeClass = {
  live: 'mahjong-tile-live',
  mini: 'mahjong-tile-mini',
  rack: 'mahjong-tile-rack',
  river: 'mahjong-tile-river',
};

const orientationClass = {
  upright: '',
  left: 'rotate-90',
  right: '-rotate-90',
  top: 'rotate-180',
};

const pipColor = (index: number) => ['#1d5fa7', '#b82725', '#2f7f55'][index % 3];

function DotFace({ value }: { value: number }) {
  return (
    <div className="absolute inset-[12%]">
      {(pipLayouts[value] ?? pipLayouts[1]).map(([left, top], index) => (
        <span
          className="dot-pip"
          key={`${left}-${top}-${index}`}
          style={{
            left: `${left}%`,
            top: `${top}%`,
            ['--pip-color' as string]: pipColor(index),
          }}
        />
      ))}
    </div>
  );
}

function HonorFace({ tile }: { tile: Tile }) {
  if (tile.suite === 'wind') {
    const windName = tile.name.split(' ')[0];
    return <span className="tile-glyph tile-glyph-wind">{windGlyphs[windName] ?? windName[0]}</span>;
  }

  if (tile.name.includes('Red')) return <span className="tile-glyph tile-glyph-red">中</span>;
  if (tile.name.includes('Green')) return <span className="tile-glyph tile-glyph-green">發</span>;

  return (
    <span className="tile-white-dragon" aria-hidden="true">
      <span />
    </span>
  );
}

export function MahjongTile({
  tile,
  currentValue,
  className,
  isMini = false,
  size,
  orientation = 'upright',
  faceDown = false,
  fanIndex,
  muted = false,
}: MahjongTileProps) {
  const displayValue = currentValue ?? tile.baseValue;
  const visualSize = size ?? (isMini ? 'mini' : 'live');
  const fanRotation = fanIndex !== undefined ? Math.max(-2, Math.min(2, fanIndex)) : 0;

  return (
    <div
      className={cn('mahjong-tile-wrap group', orientationClass[orientation], muted && 'opacity-70 saturate-[0.75]', className)}
      style={{ ['--fan-rotation' as string]: `${fanRotation}deg` }}
      aria-label={tile.name}
    >
      <div
        className={cn(
          'mahjong-tile',
          sizeClass[visualSize],
          fanIndex !== undefined && 'mahjong-tile-fanned',
          faceDown && 'mahjong-tile-facedown'
        )}
      >
        <div className="tile-edge-strip" />
        {!faceDown && (
          <>
            <span className="tile-value-mark">{displayValue}</span>
            {tile.isNumber ? <DotFace value={tile.baseValue} /> : <HonorFace tile={tile} />}
          </>
        )}
        {faceDown && <div className="tile-back-mark" />}
      </div>
    </div>
  );
}
