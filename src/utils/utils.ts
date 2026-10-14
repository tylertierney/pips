import type { ClassValue } from 'clsx'
import clsx from 'clsx'
import type { CSSProperties } from 'react'
import { twMerge } from 'tailwind-merge'
import type { UiDomino } from '../components/GameHome/Game/Game'
import type { Coords, Game, IDomino } from '../models/models'

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs))
}

export const normalizeRotation = (rotation: number | undefined): number => {
  if (rotation === undefined) return 0
  return (((rotation ?? 0) % 360) + 360) % 360
}

export const getTranslateFromRotation = (
  rotation: number | undefined,
): CSSProperties['translate'] => {
  const normalized = normalizeRotation(rotation)

  switch (normalized) {
    case 90:
      return '50% 0'
    case 180:
      return '100% 100%'
    case 270:
      return '0 200%'
    default:
      return '0'
  }
}

export const isVertical = (rotation: number): boolean => {
  if (!rotation || rotation % 360 === 0 || rotation % 180 === 0) return false
  return true
}

export const traverseStackToFindCell = (
  x: number,
  y: number,
): Coords | null => {
  const elementStack = document.elementsFromPoint(x, y) as HTMLElement[]

  let foundCell = null
  for (const el of elementStack) {
    if (el.dataset['coords']) {
      foundCell = JSON.parse(el.dataset['coords']) as Coords
      break
    }
  }

  return foundCell
}

export const convertGameDominoesToUiDominoes = (
  dominoes: IDomino[],
): UiDomino[] => {
  return dominoes.map((d, idx) => ({ id: idx, domino: d, rotation: 0 }))
}

export const isValidPlacement = ({
  targetR,
  targetC,
  dominoId,
  rotation,
  height,
  width,
  game,
  dominoes,
}: {
  targetR: number
  targetC: number
  dominoId: number
  rotation: number
  height: number
  width: number
  game: Game
  dominoes: UiDomino[]
}): boolean => {
  const vertical = isVertical(rotation)
  const [targetR2, targetC2] = vertical
    ? [targetR + 1, targetC]
    : [targetR, targetC + 1]

  return (
    isPlacedInBounds({
      targetR,
      targetC,
      targetR2,
      targetC2,
      height,
      width,
      game,
    }) &&
    isNotColldingWithOtherDominoes({
      targetR,
      targetC,
      targetR2,
      targetC2,
      dominoes,
      dominoId,
    })
  )
}

export const isPlacedInBounds = ({
  targetR,
  targetC,
  targetR2,
  targetC2,

  height,
  width,
  game,
}: {
  targetR: number
  targetC: number
  targetR2: number
  targetC2: number
  height: number
  width: number
  game: Game
}) => {
  const firstSquareOutOfBounds =
    targetR < 0 || targetR >= height || targetC < 0 || targetC >= width

  const secondSquareOutOfBounds =
    targetR2 < 0 || targetR2 >= height || targetC2 < 0 || targetC2 >= width

  if (firstSquareOutOfBounds || secondSquareOutOfBounds) return false

  const emptyAndRegionCells = new Set(
    game.regions.flatMap((r) => r.indices.map((coords) => String(coords))),
  )

  const blankCells = new Set(
    Array.from({ length: height })
      .map((_, r) =>
        Array.from({ length: width }).map((_, c) => String([r, c])),
      )
      .flat()
      .filter((str) => !emptyAndRegionCells.has(str)),
  )

  if (
    blankCells.has(String([targetR, targetC])) ||
    blankCells.has(String([targetR2, targetC2]))
  )
    return false

  return true
}

export const isNotColldingWithOtherDominoes = ({
  targetR,
  targetC,
  targetR2,
  targetC2,
  dominoes,
  dominoId,
}: {
  targetR: number
  targetC: number
  targetR2: number
  targetC2: number
  dominoes: UiDomino[]
  dominoId: number
}) => {
  const allDominoesExceptThisOne = dominoes.filter((d) => d.id !== dominoId)

  for (const { r, c, rotation } of allDominoesExceptThisOne) {
    if (r === undefined || c === undefined) continue

    const existingDominoCoords: [Coords, Coords] = [
      [r, c],
      isVertical(rotation) ? [r + 1, c] : [r, c + 1],
    ]

    for (const [existingR, existingC] of existingDominoCoords) {
      if (
        (targetR === existingR && targetC === existingC) ||
        (targetR2 === existingR && targetC2 === existingC)
      )
        return false
    }
  }

  return true
}

// export const deriveGridStateFromPlacedDominoes = (game: Game) => {
//   const grid = Arr
// }
